/**
 * Event loop demo — ordine di esecuzione: 1, 5, 4, 3, 2
 *
 * Perché quest'ordine?
 *
 * 1. `console.log("1")` è codice sincrono: va in call stack ed esegue subito.
 * 2. `setTimeout(..., 0)` NON esegue subito, nemmeno con delay 0: la callback
 *    viene messa in coda come macrotask. Viene eseguita solo dopo che tutti i 
 * microtask sono stati svuotati.
 * 3. `Promise.resolve().then(...)` I microtask hanno priorità sui macrotask, ma sono
 *    processati DOPO la coda di process.nextTick in Node.js.
 * 4. `process.nextTick(...)` è specifico di Node.js e ha una coda separata e
 *    a priorità più alta di qualsiasi microtask/Promise: viene sempre svuotata
 *    per intero PRIMA che l'event loop processi la coda dei microtask standard,
 *    e anche prima di passare a qualunque fase successiva dell'event loop.
 * 5. `console.log("5")` è sincrono come il punto 1, quindi esegue subito dopo
 *    di esso, prima che qualsiasi coda asincrona venga processata.
 *
 * Ordine risultante:
 *
 *   Fase 1 — Call stack (sincrono):
 *     "1" -> "5"
 *
 *   Fase 2 — Coda process.nextTick (priorità massima tra le code async):
 *     "4"
 *
 *   Fase 3 — Coda microtask / Promise:
 *     "3"
 *
 *   Fase 4 — Coda macrotask (timers):
 *     "2"
 *
 * Risultato finale: 1, 5, 4, 3, 2
 *
 * Nota: questo ordine (nextTick prima dei microtask Promise) è una specificità
 * di Node.js. Nei browser non esiste process.nextTick, quindi lì l'ordine
 * sarebbe semplicemente: sincrono -> microtask (Promise) -> macrotask (setTimeout).
 */

console.log('1')

setTimeout(() => console.log('2'), 0)

Promise.resolve().then(() => console.log('3'))

process.nextTick(() => console.log('4'))

console.log('5')