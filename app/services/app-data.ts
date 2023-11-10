import Service from '@ember/service';
// import {
//   BaseDirectory,
//   createDir,
//   exists,
//   readTextFile,
//   writeTextFile,
// } from '@tauri-apps/api/fs';
// import { dirname } from '@tauri-apps/api/path';
// import { appWindow } from '@tauri-apps/api/window';

export class AppDataService extends Service {
  // Config
  private _debug: boolean = false;
  // private dir: number = BaseDirectory.AppData;

  async load(file: string) {
    this.debug('load', file);
    return localStorage.getItem(`flimmerkasten:${file}`);
  }

  async save(file: string, content: string) {
    this.debug('save', file);
    localStorage.setItem(`flimmerkasten:${file}`, content);
  }

  // async load(file: string) {
  //   this.debug('load', file);

  //   file = this.prependWindowLabel(file);
  //   const ok = await exists(file, { dir: this.dir });
  //   if (!ok) {
  //     return;
  //   }
  //   return await readTextFile(file, { dir: this.dir });
  // }

  // async save(file: string, content: string) {
  //   this.debug('save', file);

  //   file = this.prependWindowLabel(file);
  //   await this.ensureDirectory(file);
  //   return await writeTextFile(file, content, { dir: this.dir });
  // }

  // private async ensureDirectory(path: string) {
  //   this.debug('ensureDirectory', path);

  //   path = await dirname(path);
  //   const ok = await exists(path, { dir: this.dir });
  //   if (!ok) {
  //     await createDir(path, { dir: this.dir, recursive: true });
  //   }
  // }

  // private prependWindowLabel(file: string) {
  //   return `${appWindow.label}/${file}`;
  // }

  private debug(...args: any[]) {
    if (this._debug) {
      console.log('AppData', ...args);
    }
  }
}

export default AppDataService;

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'app-data': AppDataService;
  }
}
