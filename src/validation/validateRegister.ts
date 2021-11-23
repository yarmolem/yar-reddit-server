import validator from 'validator'

import { UsernamePasswordInput } from '../resolvers/user.resolvers'

export const validateRegister = ({
  email,
  username,
  password
}: UsernamePasswordInput) => {
  if (!validator.isEmail(email)) {
    return [{ field: 'email', message: 'Invalid email' }]
  }

  if (username.includes('@')) {
    return [{ field: 'username', message: 'Cannot include an @' }]
  }

  if (username.trim().length <= 2) {
    return [{ field: 'username', message: 'Must be greater than 2' }]
  }

  if (password.trim().length <= 2) {
    return [{ field: 'password', message: 'Must be greater than 2' }]
  }

  return null
}
