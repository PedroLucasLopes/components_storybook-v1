import en from './en.json';
import es from './es.json';
import ptBR from './pt-BR.json';

/**
 * Traduções de uma aplicação de exemplo, para o Storybook. **Nada aqui vai para
 * produção.**
 *
 * É exatamente o que um front do ecossistema registra no vue-i18n dele: um JSON
 * por língua, com o código da língua como nome. O `DlUserMenu` lista essas
 * línguas sozinho, e a story `Layout/App shell` chama as chaves com `t()`.
 */
export const appMessages = { en, es, 'pt-BR': ptBR };
