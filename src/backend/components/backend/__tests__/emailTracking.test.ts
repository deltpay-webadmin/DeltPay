import { describe, it, expect } from 'vitest';
import { foldMessages, type EmailEventRow } from '../pages/EmailTimeline';
import { suppressionBlocks } from '../../../../../supabase/functions/_shared/unsubscribe_token.ts';

// ── Helpers ────────────────────────────────────────────────────────────────
let nextId = 1;
function row(over: Partial<EmailEventRow> & Pick<EmailEventRow, 'event' | 'created_at'>): EmailEventRow {
  return {
    id: nextId++,
    email_id: null,
    recipient: 'owner@example.com',
    reason: null,
    subject: null,
    campaign: null,
    link_url: null,
    kind: null,
    ...over,
  };
}

describe('foldMessages — one message per Resend email_id', () => {
  it('folds sent + delivered + opens + click into a single message', () => {
    const msgs = foldMessages([
      row({ email_id: 'e1', event: 'sent', created_at: '2026-08-10T14:00:00Z', subject: 'Your application is waiting', campaign: 'DP-4', kind: 'transactional' }),
      row({ email_id: 'e1', event: 'delivered', created_at: '2026-08-10T14:00:09Z' }),
      row({ email_id: 'e1', event: 'opened', created_at: '2026-08-10T16:31:00Z' }),
      row({ email_id: 'e1', event: 'opened', created_at: '2026-08-11T09:02:00Z' }),
      row({ email_id: 'e1', event: 'clicked', created_at: '2026-08-11T09:03:00Z', link_url: 'https://www.deltpay.com/apply/abc' }),
    ]);

    expect(msgs).toHaveLength(1);
    const m = msgs[0];
    // Metadata rides on the `sent` row; later events carry none of it and
    // must not blank it out.
    expect(m.subject).toBe('Your application is waiting');
    expect(m.campaign).toBe('DP-4');
    expect(m.kind).toBe('transactional');
    expect(m.delivered).toBe(true);
    expect(m.opens).toBe(2);
    expect(m.firstOpenAt).toBe('2026-08-10T16:31:00Z');
    expect(m.clicks).toEqual([{ at: '2026-08-11T09:03:00Z', url: 'https://www.deltpay.com/apply/abc' }]);
    expect(m.problem).toBeNull();
  });

  it('anchors the message at its send time, not the latest event', () => {
    // Rows arrive newest-first from the query; the timeline still has to
    // order by when the email went out.
    const msgs = foldMessages([
      row({ email_id: 'new', event: 'sent', created_at: '2026-08-11T10:00:00Z', subject: 'Newer' }),
      row({ email_id: 'old', event: 'clicked', created_at: '2026-08-11T18:00:00Z' }),
      row({ email_id: 'old', event: 'sent', created_at: '2026-08-01T10:00:00Z', subject: 'Older' }),
    ]);
    expect(msgs.map(m => m.subject)).toEqual(['Newer', 'Older']);
    expect(msgs[1].sentAt).toBe('2026-08-01T10:00:00Z');
  });

  it('keeps every send_error separate — they have no email_id to group on', () => {
    const msgs = foldMessages([
      row({ event: 'send_error', created_at: '2026-08-10T14:00:00Z', subject: 'Approved', reason: 'resend 422: invalid to' }),
      row({ event: 'send_error', created_at: '2026-08-11T14:00:00Z', subject: 'Approved', reason: 'resend 422: invalid to' }),
    ]);
    // Two failed attempts must read as two failures, not one.
    expect(msgs).toHaveLength(2);
    expect(msgs[0].problem).toEqual({ event: 'send_error', reason: 'resend 422: invalid to' });
  });

  it('surfaces a bounce on a message that was also opened', () => {
    // Possible with multi-recipient or delayed-bounce cases; the problem is
    // the fact worth showing.
    const msgs = foldMessages([
      row({ email_id: 'e2', event: 'sent', created_at: '2026-08-10T14:00:00Z', campaign: 'DP-14' }),
      row({ email_id: 'e2', event: 'opened', created_at: '2026-08-10T15:00:00Z' }),
      row({ email_id: 'e2', event: 'bounced', created_at: '2026-08-10T16:00:00Z', reason: 'mailbox does not exist' }),
    ]);
    expect(msgs[0].problem?.event).toBe('bounced');
    expect(msgs[0].opens).toBe(1);
  });

  it('handles events arriving before their sent row is visible', () => {
    const msgs = foldMessages([
      row({ email_id: 'e3', event: 'opened', created_at: '2026-08-10T15:00:00Z' }),
    ]);
    expect(msgs).toHaveLength(1);
    expect(msgs[0].subject).toBe('(no subject)');
    expect(msgs[0].opens).toBe(1);
  });

  it('returns nothing for a lead that has never been emailed', () => {
    expect(foldMessages([])).toEqual([]);
  });
});

describe('suppressionBlocks — marketing opt-out must not kill transactional mail', () => {
  it('lets everything through when there is no suppression row', () => {
    expect(suppressionBlocks(null, 'transactional')).toBe(false);
    expect(suppressionBlocks(null, 'marketing')).toBe(false);
    expect(suppressionBlocks(undefined, 'marketing')).toBe(false);
  });

  it("blocks both kinds for a hard bounce / complaint ('all')", () => {
    expect(suppressionBlocks('all', 'transactional')).toBe(true);
    expect(suppressionBlocks('all', 'marketing')).toBe(true);
  });

  it("blocks only promotional mail for an unsubscribe ('marketing')", () => {
    // The whole point of the scope: someone who opted out of the cross-sell
    // still gets told their application was approved.
    expect(suppressionBlocks('marketing', 'marketing')).toBe(true);
    expect(suppressionBlocks('marketing', 'transactional')).toBe(false);
  });
});
