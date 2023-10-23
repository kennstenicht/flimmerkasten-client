// Types for compiled templates
declare module 'flimmerkasten-client/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module '*.css' {
  const styles: { [className: string]: string };
  export default styles;
}
