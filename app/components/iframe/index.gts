import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
// @ts-ignore
import YouTubePlayer from 'youtube-player';

import PeerService from 'flimmerkasten-client/services/peer';

interface IframeSignature {
  Element: HTMLIFrameElement;
  Args: {};
}

const videos = [
  'XAyTOC0U7W0',
  'zA62-9atzVo',
  'j4ZtknkXlc8',
  '9R4wS7RzpXw',
  '7qZcznOPzeY',
  'gfshMHC-kNM',
  'dRznUl4di8A',
  'xmTDYyy_9x8',
  'DLgodmcChO8',
  'VKo4s_7-Afc',
  'H94RF3InQm8',
  'Mm3uC8uux8c',
  'MwYQMpd_eZA',
  'P1eGtYVWLQ4',
  'BV2OZ0IaboM',
  'IuSYKXQvrZo',
  'ho7b4rogxv8',
  'MM62q4PkRzI',
  '2srdGLYF25E',
  '6ezlW7tsAXA',
  '8eXXc4oSqN8',
  'xFjyVbJI5cg',
  'prww1aSCy0M',
  'JbOKkZ3fyyM',
  'd83J4DPgrAc',
  'dPM3wPhaMvE',
  'bS4aOhRFgdw',
  'jeMDLRontGI',
  '3ZFtUHU',
  'xgDSWhOVtz0',
  'QaPIXIETpHE',
  'KfdpFh7C5BE',
  'hPzXPM5P_LY',
  'EwFnBdaiblo',
  'I1Z0zomERu8',
  'dAdno-oYMRQ',
  'pfnODbvpwDY',
];

export class Iframe extends Component<IframeSignature> {
  // Services
  @service declare peer: PeerService;

  // Defaults
  @tracked player?: YouTubePlayer;

  createPlayer = (element: HTMLDivElement) => {
    this.player = YouTubePlayer(element, {
      autoplay: 1,
      controls: 0,
      mute: 1,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Custom video id list
    const nextIndex = (videos.length * Math.random()) | 0;
    this.player.loadPlaylist(videos, nextIndex);

    // Playlist
    // this.player.loadPlaylist({
    //   list: 'PLJpymKu-E9PeQKTvgaXL7H5YFeEyRa0_v',
    //   listType: 'playlist',
    // });
    // this.player.playVideo();

    //
    this.player.on('stateChange', (event: any) => {
      console.log(event);

      if (event.data === -1) {
        console.log(event.target);
        this.player.setShuffle(true);
      }
    });
  };

  // Template
  <template>
    <div {{didInsert this.createPlayer}}></div>
  </template>
}

export default Iframe;
