import { ReuniaoRepository } from '../repositories/ReuniaoRepository';
// Conditional UPDATE is safe across concurrent server replicas and manual changes.
export function iniciarConclusaoAutomatica() {
  const repository = new ReuniaoRepository();
  let running = false;
  const executar = async () => {
    if (running) return;
    running = true;
    try { await repository.concluirVencidas(); }
    catch (error) { console.error('Erro ao concluir reuniões vencidas', error); }
    finally { running = false; }
  };
  void executar();
  const timer = setInterval(() => void executar(), 60000);
  timer.unref();
  return () => clearInterval(timer);
}
