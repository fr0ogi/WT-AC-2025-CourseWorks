import { Ticket } from '@/models/Tickets'

export async function createTicket(data) {
  const { queue, title, user, message } = data

  const payload = {
    queue,
    title,
    user,
    agent: null,
    messages: [
      {
        from: 'user',
        text: message,
      },
    ],
  }

  try {
    const ticket = await Ticket.create(payload)

    return ticket
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

export async function addMessage(data) {
  const { ticketId, from, text } = data

  if (!ticketId) {
    throw new Error('ticketId is required')
  }

  if (!['user', 'agent'].includes(from)) {
    throw new Error('Invalid "from" value')
  }

  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Text is required')
  }

  try {
    const { isClose } = await Ticket.findById(ticketId).select('isClose')

    if (isClose) {
      throw new Error('Ticket closed!')
    }

    const updated = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        $push: {
          messages: {
            from,
            text: text.trim(),
          },
        },
      },
      { new: true, runValidators: true }
    )

    if (!updated) {
      throw new Error('Ticket not found')
    }

    return updated
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

export async function claimTicket(data) {
  const { ticketId, agent } = data

  if (!ticketId) {
    throw new Error('ticketId is required')
  }

  try {
    const { isClose } = await Ticket.findById(ticketId).select('isClose')

    if (isClose) {
      throw new Error('Ticket closed!')
    }

    const updated = await Ticket.findOneAndUpdate(
      { _id: ticketId, agent: null },
      { $set: { agent } },
      { new: true, runValidators: true }
    )

    if (!updated) {
      throw new Error('Ticket not found or already claimed')
    }

    return updated
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}

export async function closeTicket(data) {
  const { ticketId } = data

  if (!ticketId) {
    throw new Error('ticketId is required')
  }

  try {
    const { isClose } = await Ticket.findById(ticketId).select('isClose')

    if (isClose) {
      throw new Error('Ticket already closed!')
    }

    const updated = await Ticket.findOneAndUpdate(
      { _id: ticketId, isClose: { $ne: true } },
      {
        $set: { isClose: true },
      },
      { new: true, runValidators: true }
    )

    console.log('updated', updated)

    if (!updated) {
      throw new Error('Ticket already closed or not found')
    }

    return updated
  } catch (error) {
    console.error(error)
    throw new Error(error.message)
  }
}
