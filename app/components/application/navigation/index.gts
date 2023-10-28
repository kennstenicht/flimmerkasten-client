import { LinkTo } from '@ember/routing';
import { bem } from 'flimmerkasten-client/helpers/bem';
import styles from './styles.css';

<template>
  <nav class={{bem styles}} aria-label='Developer Navigation'>
    <ul class={{bem styles 'list'}}>
      <li><LinkTo @route='stream'>Stream</LinkTo></li>
      <li><LinkTo @route='iframe'>IFrame</LinkTo></li>
      <li><LinkTo @route='tetris'>Tetris</LinkTo></li>
    </ul>
  </nav>
</template>
