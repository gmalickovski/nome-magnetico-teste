-- Adicionar coluna 'gender' para armazenar o sexo (Masculino, Feminino, Neutro) usado nas sugestões nominais
ALTER TABLE nome_magnetico.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT;
