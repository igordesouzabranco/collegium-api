// Erro de regra de negócio: o handleError converte na resposta da API
export default class AppError extends Error {
  constructor(status, errors) {
    const lista = Array.isArray(errors) ? errors : [errors];
    super(lista[0]);
    this.name = 'AppError';
    this.status = status;
    this.errors = lista;
  }
}
