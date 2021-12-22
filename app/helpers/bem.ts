import { helper } from '@ember/component/helper';
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';

interface Modifiers {
  modifiers: {
    [key: string]: string
  }
}

export function bem(params: [string, string], { modifiers }: Modifiers) {
  let [block, element] = params;
  let classes: string[] = [];
  let baseClass = !isEmpty(element) ? `${block}__${element}` : block;

  classes.push(baseClass);

  if (modifiers) {
    Object.keys(modifiers).forEach((key) => {
      let modifier = modifiers[key];

      if (isEmpty(modifier)) {
        return
      }
      if (typeof modifier === 'boolean') {
        if (modifier) {
          classes.push(`${baseClass}--${key}`);
        }
      } else if (isArray(modifier)) {
        // @ts-ignore
        modifier.forEach((modifier) => {
          classes.push(`${baseClass}--${key}-${modifier}`);
        });
      } else {
        classes.push(`${baseClass}--${key}-${modifier}`);
      }
    });
  }

  return classes.join(' ');
}

export default helper(bem);

