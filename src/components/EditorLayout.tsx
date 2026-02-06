import { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Flex, Button, Heading, Text, Divider } from '@adobe/react-spectrum'
import Back from '@spectrum-icons/workflow/Back'

type EditorLayoutProps = {
  title: string
  toolbar?: ReactNode
  children: ReactNode
}

export function EditorLayout({ title, toolbar, children }: EditorLayoutProps) {
  const navigate = useNavigate()
  const { docId } = useParams()

  return (
    <Flex direction="column" width="100%" height="100%" UNSAFE_style={{ overflow: 'hidden' }}>
      <Flex alignItems="center" gap="size-200" UNSAFE_style={{ padding: 8, backgroundColor: 'var(--spectrum-global-color-gray-100, #f5f5f5)' }}>
        <Button variant="secondary" onPress={() => navigate('/')} aria-label="Back to home">
          <Back />
        </Button>
        <Divider orientation="vertical" size="S" />
        <Heading level={3} margin={0}>{title}</Heading>
        <Text UNSAFE_style={{ color: '#666', fontSize: 12 }}>Doc: {docId}</Text>
        <Flex flex={1} justifyContent="end" gap="size-100">
          {toolbar}
        </Flex>
      </Flex>
      <Flex flex={1} direction="column" UNSAFE_style={{ overflow: 'auto', minHeight: 0 }}>
        {children}
      </Flex>
    </Flex>
  )
}
