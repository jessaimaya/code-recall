#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import { program } from 'commander';
import App from './components/App';

program
  .name('coderecall')
  .description('Offline-first coding challenge trainer using spaced repetition')
  .version('1.0.0');

program
  .command('review')
  .description('Review due challenges')
  .option('-e, --editor <editor>', 'specify editor to use')
  .option('-c, --count <count>', 'number of challenges to review', '10')
  .action((options) => {
    render(<App command="review" options={options} />);
  });

program
  .command('add <files...>')
  .description('Add challenge(s) from file(s)')
  .option('--verify', 'verify challenge format before adding')
  .action((files, options) => {
    render(<App command="add" files={files} options={options} />);
  });

program
  .command('stats')
  .description('Show progress statistics')
  .option('-f, --format <format>', 'output format (table, json)', 'table')
  .action((options) => {
    render(<App command="stats" options={options} />);
  });

program
  .command('list')
  .description('List challenges')
  .option('--due', 'show only due challenges')
  .option('-t, --tag <tag>', 'filter by tag')
  .option('-p, --pattern <pattern>', 'filter by pattern')
  .action((options) => {
    render(<App command="list" options={options} />);
  });

program
  .command('sync <direction> <target>')
  .description('Sync challenges and progress')
  .action((direction, target, options) => {
    render(<App command="sync" direction={direction} target={target} options={options} />);
  });

program
  .command('config')
  .description('Configure settings')
  .option('-e, --editor <editor>', 'set default editor')
  .option('-d, --data-dir <dir>', 'set data directory')
  .action((options) => {
    render(<App command="config" options={options} />);
  });

program.parse();