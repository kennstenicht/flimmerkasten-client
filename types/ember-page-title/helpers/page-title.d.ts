declare module 'ember-page-title/helpers/page-title' {
  import Helper from '@ember/component/helper';

  export class PageTitle extends Helper<{
    Args: {
      Positional: [value: T];
    };
    Return: '';
  }> {}
  export default PageTitle;
}
