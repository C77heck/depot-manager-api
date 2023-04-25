import { Server } from './modules/api/server';

Server.instance
    .boot()
    .then((server) => server.start())
    .catch(err => console.log(err));
