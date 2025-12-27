'use client'

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Table, Card, Flex, Select, Text, Dialog, IconButton } from '@radix-ui/themes'
import { PlusIcon, TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'

import { Loading } from '@/components/Loading'
import { MyButton } from '@/components/MyButton'

import { CreateQueueModal } from '@/modals/CreateQueueModal'
import { UpdateQueueModal } from '@/modals/UpdateQueueModal'

export default function Page() {
  const [queues, setQueues] = useState([])
  const [selectedQueue, setSelectedQueue] = useState(null)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [openCreateQueue, setOpenCreateQueue] = useState(false)
  const [openUpdateQueue, setOpenUpdateQueue] = useState(false)

  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  const abortRef = useRef(null)
  const mountedRef = useRef(true)

  const loadQueues = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      if (mountedRef.current) {
        setLoading(true)
        setError(null)
      }

      const token = JSON.parse(localStorage.getItem('token') || 'null')
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })

      const res = await fetch(`/api/admin/queue?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      })

      if (!res.ok) {
        const msg = await res.text().catch(() => '')
        throw new Error(msg || `Request failed: ${res.status}`)
      }

      const data = await res.json()

      if (!mountedRef.current) {
        return
      }

      setQueues(Array.isArray(data.queues) ? data.queues : [])
      setTotal(Number(data.total) || 0)
      setTotalPages(Number(data.totalPages) || 1)
    } catch (e) {
      if (e?.name !== 'AbortError' && mountedRef.current) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [page, limit])

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true)

      const token = JSON.parse(localStorage.getItem('token') || 'null')

      await fetch(`/api/admin/queue/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      loadQueues()
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    loadQueues()
    return () => abortRef.current?.abort()
  }, [loadQueues])

  const from = useMemo(() => (total ? (page - 1) * limit + 1 : 0), [page, limit, total])
  const to = useMemo(() => Math.min(page * limit, total), [page, limit, total])

  const handlePrev = () => setPage((p) => Math.max(1, p - 1))
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1))
  const handleLimit = (value) => {
    setLimit(Number(value))
    setPage(1)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-dvh'>
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-dvh'>
        <Card className='text-red-400 bg-red-200 border-red-400'>
          <h3>Error: {error}</h3>
        </Card>
      </div>
    )
  }

  return (
    <>
      {/* Controls */}
      <Flex direction='column' gap='3'>
        <Flex gap='3' className='md:flex-row flex-col'>
          <Dialog.Root open={openCreateQueue} onOpenChange={setOpenCreateQueue}>
            <Dialog.Trigger asChild>
              <MyButton icon={<PlusIcon />} variant='soft'>
                Create Queue
              </MyButton>
            </Dialog.Trigger>
            <CreateQueueModal
              onSuccess={() => {
                loadQueues()
                setOpenCreateQueue(false)
              }}
            />
          </Dialog.Root>
        </Flex>

        <Flex justify='between'>
          <Flex align='center' gap='3'>
            <Flex align='center' gap='3'>
              <MyButton variant='soft' disabled={page <= 1 || loading} onClick={handlePrev}>
                Prev
              </MyButton>
              <MyButton size='2'>
                Page {page} / {totalPages}
              </MyButton>
              <MyButton
                variant='soft'
                disabled={page >= totalPages || loading}
                onClick={handleNext}
              >
                Next
              </MyButton>
            </Flex>
          </Flex>

          <Flex align='center' gap='2'>
            <Select.Root defaultValue={String(limit)} onValueChange={handleLimit}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value='10'>10</Select.Item>
                <Select.Item value='20'>20</Select.Item>
                <Select.Item value='50'>50</Select.Item>
                <Select.Item value='100'>100</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
      </Flex>

      {/* Table */}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Controls</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {queues.map((queue) => (
            <Table.Row key={queue._id}>
              <Table.Cell>{queue.title}</Table.Cell>
              <Table.Cell>
                <Flex gap='2'>
                  <IconButton
                    onClick={() => handleDelete(queue._id)}
                    variant='soft'
                    color='crimson'
                    disabled={isDeleting}
                  >
                    <TrashIcon />
                  </IconButton>

                  <IconButton
                    variant='soft'
                    color='grass'
                    disabled={isDeleting}
                    onClick={() => {
                      setSelectedQueue(queue)
                      setOpenUpdateQueue(true)
                    }}
                  >
                    <Pencil1Icon />
                  </IconButton>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Flex align='center' justify='center' className='mt-2.5'>
        <Text size='2'>
          {from}-{to} from {total}
        </Text>
      </Flex>

      <Dialog.Root
        open={openUpdateQueue}
        onOpenChange={(v) => {
          setOpenUpdateQueue(v)
          if (!v) setSelectedQueue(null)
        }}
      >
        <UpdateQueueModal
          currentQueue={selectedQueue}
          onSuccess={() => {
            loadQueues()
            setOpenUpdateQueue(false)
          }}
        />
      </Dialog.Root>
    </>
  )
}
