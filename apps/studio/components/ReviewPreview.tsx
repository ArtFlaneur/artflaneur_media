import React from 'react'
import {Card, Stack, Text, Flex, Box} from '@sanity/ui'

export const ReviewPreview = (props: any) => {
  const {title, mainImage, excerpt, sponsor} = props
  
  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={3}>
        {mainImage && (
          <Box>
            <img 
              src={mainImage.asset?.url} 
              alt={title || 'Preview'} 
              style={{width: '100%', height: 'auto', borderRadius: '4px'}}
            />
          </Box>
        )}
        <Stack space={2}>
          <Text size={3} weight="bold">{title || 'Untitled'}</Text>
          {excerpt && <Text size={1} muted>{excerpt}</Text>}
        </Stack>
        {sponsor && (
          <Flex align="center" gap={2}>
            <Text size={1} muted>Sponsored by:</Text>
            {sponsor.logo && (
              <img 
                src={sponsor.logo.asset?.url} 
                alt={sponsor.name} 
                style={{height: `${sponsor.logoSize || 40}px`, width: 'auto'}}
              />
            )}
            <Text size={1} weight="semibold">{sponsor.name}</Text>
          </Flex>
        )}
      </Stack>
    </Card>
  )
}