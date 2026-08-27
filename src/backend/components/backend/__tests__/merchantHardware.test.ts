import { describe, it, expect } from 'vitest';
import {
  fromDb,
  devicesForMerchant,
  nextHardwareStatus,
  HARDWARE_LADDER,
  type MerchantHardware,
} from '../merchantHardwareStore';

function device(id: string, merchantId: string): MerchantHardware {
  return {
    id,
    merchantId,
    model: 'Square Terminal',
    serial: `SN-${id}`,
    channel: 'Square',
    status: 'ordered',
    installedAt: null,
    installNotes: '',
    createdAt: '2026-08-27T00:00:00Z',
    updatedAt: '2026-08-27T00:00:00Z',
  };
}

describe('fromDb', () => {
  it('maps snake_case rows and defaults the optional fields', () => {
    const d = fromDb({
      id: 'hw1',
      merchant_id: 'M-100',
      model: 'Clover Flex',
      serial: null,
      channel: 'Luqra',
      status: 'installed',
      installed_at: '2026-08-20T12:00:00Z',
      install_notes: null,
      created_at: '2026-08-19T00:00:00Z',
      updated_at: '2026-08-20T12:00:00Z',
    });
    expect(d.merchantId).toBe('M-100');
    expect(d.serial).toBe('');
    expect(d.installNotes).toBe('');
    expect(d.status).toBe('installed');
    expect(d.installedAt).toBe('2026-08-20T12:00:00Z');
  });

  it('falls back to safe defaults on unknown channel/status', () => {
    const d = fromDb({ id: 'hw2', merchant_id: 'M-1', model: 'X', channel: '', status: '' });
    expect(d.channel).toBe('Other');
    expect(d.status).toBe('ordered');
  });
});

describe('devicesForMerchant', () => {
  it('filters to the one merchant', () => {
    const all = [device('a', 'M-1'), device('b', 'M-2'), device('c', 'M-1')];
    expect(devicesForMerchant(all, 'M-1').map(d => d.id)).toEqual(['a', 'c']);
    expect(devicesForMerchant(all, 'M-3')).toEqual([]);
  });
});

describe('nextHardwareStatus', () => {
  it('walks the ladder in order and stops at active', () => {
    expect(nextHardwareStatus('ordered')).toBe('shipped');
    expect(nextHardwareStatus('shipped')).toBe('installed');
    expect(nextHardwareStatus('installed')).toBe('active');
    expect(nextHardwareStatus('active')).toBeNull();
  });

  it('returned is off-ladder — never advanced', () => {
    expect(HARDWARE_LADDER).not.toContain('returned');
    expect(nextHardwareStatus('returned')).toBeNull();
  });
});
