# ● PROCEDIMENTOS QUE JÁ ESTÃO FUNCIONANDO

**IMPORTANTE:** Antes de fazer qualquer alteração, verificar este arquivo para não quebrar o que já está funcionando!

---

## ● DASHBOARD DO ALUNO (frontend/app/aluno/dashboard/page.js)

### Funcionalidades Ativas:
- ✓ Buscar todas as trilhas com status de inscrição (GET /api/trilhas/com-status/todas)
- ✓ Buscar progresso de cada trilha inscrita (GET /api/alunos/progresso/:trilha_id)
- ✓ Filtrar trilhas por abas: Meus Cursos | Novidades | Explorar Tudo
- ✓ Mostrar tarjas: NOVO (laranja) e CONCLUÍDO (verde)
- ✓ Mostrar progresso com barra (completadas/total lições)
- ✓ Botões: Continuar | Adquirir
- ✓ Aviso para alunos (config.aviso_alunos)
- ✓ Banner de configurações

### REGRA DE OURO - Elementos que NÃO devem ser tocados:
- Campo `{config.aviso_alunos}` deve ter bolinha (●) prefixo, NUNCA emoji
- Abas devem ter bolinha (●), NUNCA emoji
- Tarjas devem ter bolinha (●), NUNCA emoji
- Botões devem ter bolinha (●), NUNCA emoji
- Progresso: componente `<span className="pulse">` não remover (cria bolinha pulsante)

---

## ● PROFESSOR DASHBOARD (frontend/app/professor/dashboard/page.js)

### Funcionalidades Ativas:
- ✓ Listar trilhas criadas pelo professor (GET /api/trilhas)
- ✓ Criar nova trilha com upload de imagem (POST /api/trilhas)
- ✓ Editar trilha (nome, sinopse, imagem, link Asaas) - NOVO
- ✓ Deletar trilha (soft delete)
- ✓ Botões: Gerenciar | Editar | Deletar

### REGRA DE OURO - Elementos que NÃO devem ser tocados:
- Formulário de CRIAR trilha (não mexa)
- Função `handleDeletarTrilha` (não mexa)
- Grid de trilhas (não mexa)
- Modal de edição (novo - não quebrar)

---

## ● BACKEND - ROTAS DE TRILHAS (backend/routes/trilhas.js)

### Funcionalidades Ativas:
- ✓ GET /api/trilhas - Listar trilhas (professor vê suas, aluno vê inscritas)
- ✓ GET /api/trilhas/com-status/todas - Listar com status de inscrição
- ✓ POST /api/trilhas - Criar trilha com upload de imagem
- ✓ PUT /api/trilhas/:id - Editar trilha (nome, sinopse, imagem, link_asaas)
- ✓ DELETE /api/trilhas/:id - Soft delete (marca ativo=FALSE, deletado_pelo_usuario=TRUE)
- ✓ GET /api/trilhas/:id/imagem - Servir imagem da trilha

### REGRA DE OURO - Elementos que NÃO devem ser tocados:
- Validação de JWT (não remover)
- Validação de permissões (professor só vê suas)
- Auto-increment de IDs (não mexa)
- Soft delete pattern (ativo + deletado_pelo_usuario)

---

## ● BANCO DE DADOS (PostgreSQL)

### Tabelas Funcionando:
- trilhas: id, nome, descricao, sinopse, ordem, imagem_url, link_asaas, ativo, deletado_pelo_usuario, criado_por_professor_id, criado_em
- modulos: id, trilha_id, nome, ordem, ativo, deletado_pelo_usuario
- licoes: id, modulo_id, nome, video_url, ativo, deletado_pelo_usuario
- inscricoes: id, aluno_id, trilha_id, bloqueado, data_inicio
- users: id, email, senha, tipo (professor/aluno/admin)

### REGRA DE OURO:
- Sequences: trilhas_id_seq, modulos_id_seq, licoes_id_seq, inscricoes_id_seq, users_id_seq
- Todas as tabelas têm DEFAULT nextval() para IDs
- Soft delete: usar ativo=FALSE + deletado_pelo_usuario=TRUE

---

## ● CHECKLIST ANTES DE QUALQUER ALTERAÇÃO

Antes de mexer em qualquer arquivo:

1. ● Ler este arquivo
2. ● Fazer backup mental do que funciona
3. ● Verificar se a mudança vai quebrar algo já funcionando
4. ● Se mexer em bolinhas/emojis: NUNCA usar emojis, SEMPRE usar ●
5. ● Se mexer em validação: garantir que não quebra o criador/editor
6. ● Se mexer em consultas SQL: testar na DEV antes
7. ● Build local: `npm run build`
8. ● Deploy: git commit + git push + ssh deploy
9. ● Teste pós-deploy: verificar no navegador

---

## ● HISTÓRICO DE ERROS EVITÁVEIS

- ❌ Adicionar emojis sem remover em todos os lugares (quebrou aviso)
- ❌ Não salvar sequências de IDs (trilhas não criavam)
- ❌ Validação obrigatória de campos (bloqueava trilhas)
- ❌ CSS complexo com backdrop-filter (quebrou frontend 51x)
- ❌ Não verificar lógica antes de implementar (erros na edição de módulos)

**CONCLUSÃO:** Sempre ler este arquivo antes de mexer. Preserva o que funciona!
