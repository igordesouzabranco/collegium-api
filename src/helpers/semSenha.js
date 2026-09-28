// Nunca devolve senha (nem o hash) nas respostas
export default function semSenha(registro) {
  const dados = registro && typeof registro.toJSON === 'function' ? registro.toJSON() : { ...registro };
  delete dados.password_hash;
  delete dados.password;
  return dados;
}
