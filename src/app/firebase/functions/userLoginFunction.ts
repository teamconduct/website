import { User } from '../../types';
import { FirebaseFunction } from '../FirebaseFunction';

export const userLoginFunction = new FirebaseFunction<null, User>(User.builder);
