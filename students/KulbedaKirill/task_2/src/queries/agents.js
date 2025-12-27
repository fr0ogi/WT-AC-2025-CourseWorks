import { Agent } from '@/models/Agent'
import { createUser, deleteUser } from './users'

export async function createAgent(data) {
  try {
    const user = await createUser(data)

    const agentExisted = await Agent.findOne({ user: user._id })

    if (agentExisted) {
      throw new Error('Agent with this userId existed!')
    }

    const payload = {
      user: user._id,
      level: data.level,
      capacity: data.capacity,
      workload: data.workload,
      queues: data.queues,
    }

    const agent = await Agent.create(payload)
    const safeAgent = await Agent.findById(agent._id).populate('user')

    return safeAgent
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

export async function getAgent(data) {
  const { id } = data

  try {
    const agent = await Agent.findById(id)

    if (!agent) {
      throw new Error('Agent not found!')
    }

    await agent.populate({ path: 'user', select: '-password -__v' })

    return agent
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

export async function patchAgent(data) {
  const { id, level, capacity } = data

  try {
    if (Number(capacity) < 3 || Number(capacity) > 10) {
      throw new Error('Capacity out of range!')
    }

    const agent = await Agent.findByIdAndUpdate(
      id,
      { $set: { level, capacity } },
      { new: true, runValidators: true }
    )
      .populate({ path: 'user', select: '_id firstname lastname email role' })
      .lean()

    if (!agent) {
      throw new Error('Agent not found!')
    }

    return agent
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

export async function deleteAgent(data) {
  const { id } = data

  try {
    const agent = await Agent.findByIdAndDelete(id)
    console.log('agent', agent)

    if (!agent) {
      throw new Error('Agent not found!')
    }

    console.log('user id', agent.user.toString())

    const userId = agent.user.toString()

    await deleteUser(userId)

    return agent
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}
