import childProcess from 'child_process';
import fs from 'fs-extra';
import logger from 'jet-logger';
import { Provider } from './provider';

export class TSBuild extends Provider {
    public async build() {
        try {
            await this.remove('./dist/');
            // await this.copy('./src/pre-start/env/production.env', './dist/pre-start/env/production.env');
            await this.exec('tsc --build tsconfig.prod.json', './');
        } catch (err) {
            logger.err(err);
        }
    }

    private async remove(location: string): Promise<void> {
        return new Promise((resolve, reject) => {
            return fs.remove(location, (err) => (!!err ? reject(err) : resolve()));
        });
    }

    private async copy(src: string, dest: string): Promise<void> {
        return new Promise((res, rej) => fs.copy(src, dest, (err) => (!!err ? rej(err) : res())));
    }

    private async exec(cmd: string, loc: string): Promise<void> {
        return new Promise((resolve, reject) => {
            return childProcess.exec(cmd, { cwd: loc }, (err, stdout, stderr) => {
                if (stdout) {
                    logger.info(stdout);
                }

                if (stderr) {
                    logger.warn(stderr);
                }

                return !!err ? reject(err) : resolve();
            });
        });
    }
}
