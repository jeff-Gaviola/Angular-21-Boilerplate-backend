import { expressjwt } from 'express-jwt';
import config from '../config.json';
import db from '../_helpers/db';

export default function authorize(roles: any = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    expressjwt({
      secret: (config as any).secret,
      algorithms: ['HS256'],
      requestProperty: 'user',
      getToken: (req: any) => {
        const authHeader = req.headers?.authorization || req.headers?.Authorization;

        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          return authHeader.slice(7);
        }

        const accessToken = req.headers?.['x-access-token'] || req.headers?.['x-token'];
        return typeof accessToken === 'string' && accessToken.length ? accessToken : null;
      }
    }),

    async (req: any, res: any, next: any) => {
      const account = await db.Account.findByPk(req.user.id);

      if (!account || (roles.length && !roles.includes(account.role))) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      req.user.role = account.role;
      const refreshTokens = await account.getRefreshTokens();
      req.user.ownsToken = (token: string) => !!refreshTokens.find((x: any) => x.token === token);

      next();
    }
  ];
}