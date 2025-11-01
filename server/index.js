import mojo, { yamlConfigPlugin } from '@mojojs/core';
import { PrismaClient } from '@prisma/client';

import * as AppHelper from './helpers/index.js';

export const app = mojo({ exceptionFormat: 'json' });

app.plugin(yamlConfigPlugin);
app.secrets = app.config.secrets;

app.prisma = new PrismaClient();

// == User Routes ==
app.post('/api/user/login').to('user#onLogin');
app.post('/api/user/register').to('user#onRegister');
app.post('/api/user/logout').to('user#onLogout');
app.post('/api/user/session').to('user#getSession');

// == Code Routes ==
app.under(AppHelper.loggedIn).post('/api/code/new-review').to('code#onNewReview');
app.under(AppHelper.loggedIn).get('/api/code/review/:reviewId').to('code#getReviewMessages');

app.under(AppHelper.loggedIn).get('/api/code/prompts').to('code#getPrompts');
app.under(AppHelper.loggedIn).get('/api/code/models').to('code#getLLMModels');

app
  .under(AppHelper.isAdmin)
  .post('/api/code/prompt/update')
  .to('code#updateOrCreatePrompt');
app
  .under(AppHelper.isAdmin)
  .post('/api/code/model/update')
  .to('code#updateOrCreateModel');

// == Download Routes ==
app.get('/*').to('download#serveClient');

app
  .start()
  .then(() => {
    app.log.info('Server successfully started!');
  })
  .catch((error) => {
    app.log.error(`Server failed to start: ${error.message}\n${error.stack}`);
  });
