# MCA Qualification Call — Script + Gates (EN/ES)

For **warm leads** (they reached out). Posture: this is a qualification
interview — the caller holds the frame, the merchant earns the offer. The
phone gates below mirror the underwriting decision model's hard knockouts
(see `docs/sop-deal-flow.md`), so a phone-stage kill saves the whole
pipeline's time.

## Hard gates (mirror the model — fail one, end the call)

1. Decision-maker on the line
2. 6+ months in business, ≥ 3 months usable bank history
3. Monthly revenue ≥ $8,000 (model knockout is exactly $8K — screen higher)
4. ≤ 2 open positions (advances/loans debiting the account)
5. Business bank account, business-titled
6. No NSF blowups (5+ in 90 days kills the file in the model)
7. **Willing to move card processing to Delt Pay** — the real gate
8. Not a restricted vertical

---

## English

### Opening

> "Hi [Name], [Your name] from Delt Capital — you reached out about funding
> for [business name]. I've got a few questions to see if you qualify, takes
> about five minutes. You're the owner, correct?"

### Discovery (use-of-funds first — their answer is the deal)

1. "What do you need the money for?" — then silence.
2. "What happens to the business if you don't get it?"
3. "How much are you looking for, and how'd you land on that number?"
4. "What's the money going to make you?"
5. "How long in business, and what are you doing monthly in revenue?"
6. "Any positions open right now — advances, loans, anything debiting the
   account?"
7. "Have you taken funding before? How'd that go?"
8. "Who's processing your payments today, and roughly what are you paying?"

Fail a gate → "Based on that, you're not a fit for this round — here's what
would change that: [X]." End.

### The processing requirement — stated, not pitched

> "Okay, you're in range. Here's the structure, because our program has one
> requirement most don't: we fund through our own payment platform, Delt
> Pay, which means we process your card payments. Repayment comes out of
> daily processing automatically — no fixed bank debits — and because we see
> your revenue in real time, we approve faster and can go higher than
> lenders funding blind. Most merchants also come out ahead on processing
> cost versus what they're paying now.
>
> So the question is: are you open to moving your processing over as part of
> the funding?"

If hesitant:

> "Fair question to sit with. But to be direct — it's not optional, it's how
> the program works. If processing stays put, I can't fund you, and I'd
> rather tell you that now than after underwriting."

### Plaid — same call, stay on the line

> "Good. Then here's what happens next: I'm sending you a secure Plaid link
> right now. It connects your business bank account read-only so
> underwriting can verify revenue — no statements, no PDFs, about two
> minutes. Let's knock it out while we're on the phone. Best email or cell?"

**Do not hang up until the Plaid connection completes.** Completion rates
collapse after the call ends.

### Close with a deadline

> "Done. I'll have numbers for you by [day]. If anything's outstanding by
> [day], I'll assume the timing's off and move on — sound fair?"

---

## Español

### Apertura

> "Hola [Nombre], le habla [Su nombre] de Delt Capital — usted nos contactó
> sobre financiamiento para [negocio]. Tengo unas preguntas para ver si
> califica, unos cinco minutos. ¿Usted es el dueño, correcto?"

### Descubrimiento (uso de fondos primero)

1. "¿Para qué necesita el dinero?" — y silencio.
2. "¿Qué le pasa al negocio si no lo consigue?"
3. "¿Cuánto está buscando, y cómo llegó a ese número?"
4. "¿Ese dinero qué le va a generar?"
5. "¿Cuánto tiempo lleva operando, y cuánto factura al mes?"
6. "¿Tiene posiciones abiertas ahora mismo — adelantos, préstamos, algo
   debitando la cuenta?"
7. "¿Ha tomado financiamiento antes? ¿Cómo le fue?"
8. "¿Quién le procesa los pagos hoy, y más o menos cuánto está pagando?"

Si no pasa un filtro → "Con eso, no califica en esta ronda — esto es lo que
tendría que cambiar: [X]." Fin.

### El requisito de procesamiento — se informa, no se vende

> "Bien, está dentro del rango. Le explico la estructura, porque nuestro
> programa tiene un requisito que la mayoría no tiene: financiamos a través
> de nuestra propia plataforma de pagos, Delt Pay, lo que significa que
> nosotros procesamos sus pagos con tarjeta. El pago sale automáticamente
> del procesamiento diario — sin débitos fijos a su cuenta — y como vemos
> sus ventas en tiempo real, aprobamos más rápido y podemos ir más alto que
> un prestamista que financia a ciegas. La mayoría de los comercios además
> terminan pagando menos en procesamiento que lo que pagan hoy.
>
> Entonces la pregunta es: ¿está dispuesto a mover su procesamiento con
> nosotros como parte del financiamiento?"

Si duda:

> "Es válido pensarlo. Pero le soy directo — no es opcional, así funciona el
> programa. Si el procesamiento se queda donde está, no lo puedo financiar,
> y prefiero decírselo ahora y no después del análisis."

### Plaid — en la misma llamada

> "Perfecto. Entonces esto es lo que sigue: le envío ahora mismo un enlace
> seguro de Plaid. Conecta su cuenta bancaria del negocio en modo solo
> lectura para verificar ingresos — sin estados de cuenta, sin PDFs, unos
> dos minutos. Hagámoslo mientras estamos en la línea. ¿Mejor correo o
> celular?"

**No cuelgue hasta que la conexión de Plaid esté completa.**

### Cierre con fecha límite

> "Listo. Le tengo números para el [día]. Si algo queda pendiente para el
> [día], asumo que no es el momento y sigo adelante — ¿le parece justo?"

---

## After the call

- Log gate answers on the deal (use of funds, positions, current processor +
  rate). The processor/rate answer feeds the MPA pricing conversation later.
- Plaid connected → the pipeline takes over (`docs/sop-deal-flow.md`,
  Stage 2). Plaid not completed → the automated nudges chase it; your job
  was to prevent needing them.
- Truthfulness rule: only use the "most merchants save on processing" line
  while it's actually true against our Luqra/Paysafe pricing matrices — a
  merchant who fact-checks it on a statement review decides the renewal.
