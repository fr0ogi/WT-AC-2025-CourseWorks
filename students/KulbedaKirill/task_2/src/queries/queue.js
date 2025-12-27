import { Queue } from '@/models/Queue'

export async function createQueue(data) {
  const { title } = data

  try {
    const queueExisted = await Queue.findOne({ title })

    if (queueExisted) {
      throw new Error('This queue already exist!')
    }

    const queue = await Queue.create(data)

    return queue
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

export async function getQueue(data) {
  const { id } = data

  try {
    const queue = await Queue.findById(id)

    if (!queue) {
      throw new Error('Queue not found')
    }

    return queue
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

export async function patchQueue(id, data) {
  try {
    const queue = await Queue.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean()

    if (!queue) {
      throw new Error('Queue not found')
    }

    return queue
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

export async function deleteQueue(data) {
  const { id } = data

  try {
    const queue = await Queue.findByIdAndDelete(id)

    if (!queue) {
      throw new Error('Queue not found')
    }

    return queue
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}
