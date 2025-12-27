import { User } from '@/models/User'

import bcrypt from 'bcryptjs'

export async function register(data) {
  try {
    const userExisted = await User.findOne({ email: data.email })

    if (userExisted) {
      throw new Error('User Existed!')
    }

    const user = await User.create(data)
    const safeUser = await User.findById(user._id).select('-password')

    return safeUser
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export async function login(data) {
  const { email, password } = data

  try {
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('The user does not exist!')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      throw new Error('Incorrect password!')
    }

    const userSafe = await User.findById(user._id).select('-password')

    return userSafe
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export async function createUser(data) {
  try {
    const userExisted = await User.findOne({ email: data.email })

    if (userExisted) {
      throw new Error('User Existed!')
    }

    const user = await User.create(data)
    const safeUser = await User.findById(user._id).select('-password')

    return safeUser
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export async function getUser(data) {
  try {
    const user = await User.findById(data).select('-password')

    if (!user) {
      throw new Error('User not found')
    }

    return user
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export async function updateUser(id, data) {
  try {
    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
      select: '-password',
    }).lean()

    if (!user) {
      throw new Error('User not found')
    }

    return user
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export async function deleteUser(id) {
  try {
    const user = await User.findByIdAndDelete(id).select('-password')

    if (!user) {
      throw new Error('User not found')
    }

    return user
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}
