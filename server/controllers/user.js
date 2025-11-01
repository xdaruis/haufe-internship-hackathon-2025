import bcrypt from 'bcrypt';

import * as UserHelper from '../helpers/user.js';

export default class UserController {
  /**
   * @param {MojoContext} ctx
   */
  async onLogin(ctx) {
    const { username, password } = await ctx.req.json();

    if (!username || !password) {
      return ctx.render({
        json: { error: 'Username and password are required' },
        status: 400,
      });
    }

    const user = await ctx.app.prisma.users.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      return ctx.render({
        json: { error: 'User not found' },
        status: 404,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return ctx.render({
        json: { error: 'Invalid password' },
        status: 401,
      });
    }

    const session = await UserHelper.setSession(ctx, user.username);

    return ctx.render({ json: { session } });
  }

  /**
   * @param {MojoContext} ctx
   */
  async onRegister(ctx) {
    const { username, password } = await ctx.req.json();

    if (!username || !password) {
      return ctx.render({
        json: { error: 'Username and password are required' },
        status: 400,
      });
    }

    try {
      const existingUser = await ctx.app.prisma.users.findUnique({
        where: {
          username: username,
        },
      });

      if (existingUser) {
        return ctx.render({
          json: { error: 'Username or account already registered' },
          status: 400,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await ctx.app.prisma.users.create({
        data: {
          username: username,
          password: hashedPassword,
        },
      });

      const session = await UserHelper.setSession(ctx, username);

      return ctx.render({ json: { session } });
    } catch (error) {
      ctx.app.log.error(
        `Registration error: ${JSON.stringify(error, null, 2)}`,
      );
      return ctx.render({
        json: { error: 'Registration failed' },
        status: 500,
      });
    }
  }

  /**
   * @param {MojoContext} ctx
   */
  async onLogout(ctx) {
    await UserHelper.deleteSession(ctx);

    return ctx.render({
      json: {
        message: 'Logout successful',
      },
    });
  }

  /**
   * @param {MojoContext} ctx
   */
  async getSession(ctx) {
    const { expiration: _, ...userData } = await ctx.session();

    return ctx.render({
      json: {
        session: userData,
      },
    });
  }
}
