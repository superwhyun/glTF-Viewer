import * as THREE from 'three'

export interface MaterialInfo {
  name: string
  type: string
  color?: string
  emissive?: string
  metalness?: number
  roughness?: number
  opacity?: number
  transparent?: boolean
  alphaTest?: number
  doubleSided?: boolean
  wireframe?: boolean
  visible?: boolean
  maps: {
    map?: string
    normalMap?: string
    emissiveMap?: string
    metalnessMap?: string
    roughnessMap?: string
    aoMap?: string
    alphaMap?: string
    envMap?: string
    [key: string]: string | undefined
  }
}

export interface TextureInfo {
  name: string
  mapType: string
  mapTypeLabel: string
  url?: string
  dataUrl?: string
  format: string
  type: string
  wrapS: string
  wrapT: string
  magFilter: string
  minFilter: string
  flipY: boolean
  generateMipmaps: boolean
  width?: number
  height?: number
  texture: THREE.Texture
}

export function analyzeMaterial(material: any): MaterialInfo {
  const info: MaterialInfo = {
    name: material.name || 'Unnamed Material',
    type: material.type,
    visible: material.visible !== false,
    maps: {}
  }

  // Basic properties
  if (material.color && material.color.isColor) {
    info.color = `#${material.color.getHexString()}`
  }

  if (material.emissive && material.emissive.isColor) {
    info.emissive = `#${material.emissive.getHexString()}`
  }

  // PBR properties
  if (material.metalness !== undefined) {
    info.metalness = material.metalness
  }

  if (material.roughness !== undefined) {
    info.roughness = material.roughness
  }

  // Transparency
  if (material.opacity !== undefined) {
    info.opacity = material.opacity
  }

  if (material.transparent !== undefined) {
    info.transparent = material.transparent
  }

  if (material.alphaTest !== undefined) {
    info.alphaTest = material.alphaTest
  }

  // Other properties
  if (material.side !== undefined) {
    info.doubleSided = material.side === THREE.DoubleSide
  }

  if (material.wireframe !== undefined) {
    info.wireframe = material.wireframe
  }

  // Texture maps
  const mapNames = [
    'map',
    'normalMap', 
    'emissiveMap',
    'metalnessMap',
    'roughnessMap',
    'aoMap',
    'alphaMap',
    'envMap',
    'lightMap',
    'bumpMap',
    'displacementMap'
  ]

  mapNames.forEach(mapName => {
    const texture = material[mapName]
    if (texture && texture.isTexture) {
      // Try to get texture source info
      if (texture.source && texture.source.data) {
        if (texture.source.data instanceof HTMLCanvasElement) {
          info.maps[mapName] = 'canvas://' + (texture.name || 'unnamed')
        } else if (texture.source.data instanceof HTMLImageElement) {
          info.maps[mapName] = texture.source.data.src || 'image://' + (texture.name || 'unnamed')
        } else {
          info.maps[mapName] = 'data://' + (texture.name || 'unnamed')
        }
      } else {
        info.maps[mapName] = texture.name || 'texture://' + mapName
      }
    }
  })

  return info
}

export async function getTextureInfo(texture: THREE.Texture, mapType: string, materialName?: string): Promise<TextureInfo> {
  // Create a unique name using texture UUID and map type
  const uniqueName = texture.name || `${texture.uuid}_${mapType}`
  const displayName = texture.name 
    ? `${texture.name} (${formatMapType(mapType)})`
    : `${formatMapType(mapType)} Texture`

  const info: TextureInfo = {
    name: uniqueName,
    mapType,
    mapTypeLabel: displayName,
    format: getTextureFormat(texture.format),
    type: getTextureType(texture.type),
    wrapS: getWrapMode(texture.wrapS),
    wrapT: getWrapMode(texture.wrapT),
    magFilter: getFilterMode(texture.magFilter),
    minFilter: getFilterMode(texture.minFilter),
    flipY: texture.flipY,
    generateMipmaps: texture.generateMipmaps,
    texture
  }

  // Get texture dimensions
  if (texture.image) {
    info.width = texture.image.width || texture.image.videoWidth || texture.image.naturalWidth
    info.height = texture.image.height || texture.image.videoHeight || texture.image.naturalHeight
  }

  // Debug logging in development - only once per texture
  if (process.env.NODE_ENV === 'development' && !texture.userData?.debugLogged) {
    console.log('Processing texture:', {
      name: info.name,
      mapType,
      hasSource: !!texture.source,
      hasImage: !!texture.image,
      sourceType: texture.source?.data?.constructor?.name,
      imageType: texture.image?.constructor?.name,
      width: info.width,
      height: info.height
    })
    texture.userData = texture.userData || {}
    texture.userData.debugLogged = true
  }

  // Generate data URL for preview
  try {
    let dataUrl: string | null = null
    
    // Try different methods to extract texture data
    if (texture.source?.data) {
      const sourceData = texture.source.data
      
      if (sourceData instanceof HTMLImageElement) {
        // Direct image element
        if (sourceData.src && sourceData.complete) {
          info.url = sourceData.src
          dataUrl = convertImageToDataUrl(sourceData)
        }
      } else if (sourceData instanceof HTMLCanvasElement) {
        // Canvas element
        dataUrl = sourceData.toDataURL('image/png')
      } else if (sourceData instanceof ImageData) {
        // Raw image data
        dataUrl = convertImageDataToDataUrl(sourceData)
      } else if (sourceData instanceof ImageBitmap) {
        // ImageBitmap - need to convert to canvas first
        dataUrl = convertImageBitmapToDataUrl(sourceData)
      }
    }
    
    // Try to get from texture.image as fallback
    if (!dataUrl && texture.image) {
      const image = texture.image
      
      if (image instanceof HTMLImageElement && image.complete && image.src) {
        dataUrl = convertImageToDataUrl(image)
      } else if (image instanceof HTMLCanvasElement) {
        dataUrl = image.toDataURL('image/png')
      } else if (image instanceof ImageData) {
        dataUrl = convertImageDataToDataUrl(image)
      } else if (image instanceof ImageBitmap) {
        dataUrl = convertImageBitmapToDataUrl(image)
      }
    }
    
    // Set the final data URL or fallback to placeholder
    info.dataUrl = dataUrl || createPlaceholderDataUrl(formatMapType(mapType))
    
  } catch (error) {
    console.warn('Failed to generate texture preview:', error)
    info.dataUrl = createPlaceholderDataUrl(formatMapType(mapType))
  }

  return info
}

function convertImageBitmapToDataUrl(imageBitmap: ImageBitmap): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Use original size if small enough, otherwise scale down
    const maxSize = 512
    let { width, height } = imageBitmap
    
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height)
      width = Math.floor(width * ratio)
      height = Math.floor(height * ratio)
    }
    
    canvas.width = width
    canvas.height = height
    
    // Draw the ImageBitmap to canvas
    ctx.drawImage(imageBitmap, 0, 0, width, height)
    return canvas.toDataURL('image/png')
    
  } catch (error) {
    console.warn('Failed to convert ImageBitmap to data URL:', error)
    return ''
  }
}

function convertImageToDataUrl(image: HTMLImageElement): string {
  try {
    // Check if image is loaded and valid
    if (!image.complete || !image.naturalWidth || !image.naturalHeight) {
      return ''
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Use original size if small enough, otherwise scale down
    const maxSize = 512
    let { width, height } = image
    
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height)
      width = Math.floor(width * ratio)
      height = Math.floor(height * ratio)
    }
    
    canvas.width = width
    canvas.height = height
    
    // Set cross-origin handling for external images
    ctx.drawImage(image, 0, 0, width, height)
    return canvas.toDataURL('image/png')
    
  } catch (error) {
    console.warn('Failed to convert image to data URL:', error)
    return ''
  }
}

function convertImageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  canvas.width = imageData.width
  canvas.height = imageData.height
  ctx.putImageData(imageData, 0, 0)
  
  return canvas.toDataURL('image/png')
}

function createTextureDataUrlFromWebGL(texture: THREE.Texture): Promise<string> {
  return new Promise((resolve) => {
    try {
      // Skip WebGL rendering for now due to context limit issues
      // Instead, use the fallback method
      resolve(createPlaceholderDataUrl('Texture'))
    } catch (error) {
      console.warn('WebGL texture extraction failed:', error)
      resolve(createPlaceholderDataUrl('Texture'))
    }
  })
}

function createTextureDataUrl(texture: THREE.Texture): string {
  // Try to access image directly
  if (texture.image) {
    try {
      if (texture.image instanceof HTMLImageElement || texture.image instanceof HTMLCanvasElement) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return createPlaceholderDataUrl('Texture')

        const size = 256
        canvas.width = size
        canvas.height = size
        ctx.drawImage(texture.image, 0, 0, size, size)
        return canvas.toDataURL('image/png')
      } else if (texture.image instanceof ImageData) {
        // Scale ImageData to canvas
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx) {
          tempCanvas.width = texture.image.width
          tempCanvas.height = texture.image.height
          tempCtx.putImageData(texture.image, 0, 0)
          
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (ctx) {
            const size = 256
            canvas.width = size
            canvas.height = size
            ctx.drawImage(tempCanvas, 0, 0, size, size)
            return canvas.toDataURL('image/png')
          }
        }
      }
    } catch (error) {
      console.warn('Failed to create texture data URL:', error)
    }
  }

  return createPlaceholderDataUrl('Texture')
}

function createPlaceholderDataUrl(label: string): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const size = 256
  canvas.width = size
  canvas.height = size

  // Create a gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#f0f0f0')
  gradient.addColorStop(1, '#e0e0e0')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  // Add border
  ctx.strokeStyle = '#ccc'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, size - 2, size - 2)
  
  // Add text
  ctx.fillStyle = '#666'
  ctx.font = 'bold 18px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, size / 2, size / 2)

  return canvas.toDataURL('image/png')
}

function getTextureFormat(format: number): string {
  const formats: { [key: number]: string } = {
    [THREE.RGBAFormat]: 'RGBA',
    [THREE.RGBFormat]: 'RGB',
    [THREE.RedFormat]: 'Red',
    [THREE.RedIntegerFormat]: 'RedInteger',
    [THREE.RGFormat]: 'RG',
    [THREE.RGIntegerFormat]: 'RGInteger',
    [THREE.RGBAIntegerFormat]: 'RGBAInteger',
    [THREE.AlphaFormat]: 'Alpha',
    [THREE.DepthFormat]: 'Depth',
    [THREE.DepthStencilFormat]: 'DepthStencil'
  }
  return formats[format] || 'Unknown'
}

function getTextureType(type: number): string {
  const types: { [key: number]: string } = {
    [THREE.UnsignedByteType]: 'UnsignedByte',
    [THREE.ByteType]: 'Byte',
    [THREE.ShortType]: 'Short',
    [THREE.UnsignedShortType]: 'UnsignedShort',
    [THREE.IntType]: 'Int',
    [THREE.UnsignedIntType]: 'UnsignedInt',
    [THREE.FloatType]: 'Float',
    [THREE.HalfFloatType]: 'HalfFloat'
  }
  return types[type] || 'Unknown'
}

function getWrapMode(wrap: number): string {
  const modes: { [key: number]: string } = {
    [THREE.RepeatWrapping]: 'Repeat',
    [THREE.ClampToEdgeWrapping]: 'ClampToEdge',
    [THREE.MirroredRepeatWrapping]: 'MirroredRepeat'
  }
  return modes[wrap] || 'Unknown'
}

function getFilterMode(filter: number): string {
  const filters: { [key: number]: string } = {
    [THREE.NearestFilter]: 'Nearest',
    [THREE.LinearFilter]: 'Linear',
    [THREE.NearestMipmapNearestFilter]: 'NearestMipmapNearest',
    [THREE.NearestMipmapLinearFilter]: 'NearestMipmapLinear',
    [THREE.LinearMipmapNearestFilter]: 'LinearMipmapNearest',
    [THREE.LinearMipmapLinearFilter]: 'LinearMipmapLinear'
  }
  return filters[filter] || 'Unknown'
}

export function getAllMaterials(scene: any): MaterialInfo[] {
  const materials: Set<any> = new Set()
  const materialInfos: MaterialInfo[] = []

  scene.traverse((object: any) => {
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((mat: any) => materials.add(mat))
      } else {
        materials.add(object.material)
      }
    }
  })

  materials.forEach((material) => {
    materialInfos.push(analyzeMaterial(material))
  })

  return materialInfos
}

export async function getAllTextures(scene: any): Promise<TextureInfo[]> {
  const textureMap: Map<string, { texture: THREE.Texture, mapType: string, materialName?: string }> = new Map()
  const textureInfos: TextureInfo[] = []

  scene.traverse((object: any) => {
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      
      materials.forEach((material: any) => {
        const mapNames = [
          'map', 'normalMap', 'emissiveMap', 'metalnessMap',
          'roughnessMap', 'aoMap', 'alphaMap', 'envMap',
          'lightMap', 'bumpMap', 'displacementMap'
        ]

        mapNames.forEach(mapName => {
          const texture = material[mapName]
          if (texture && texture.isTexture) {
            // Create unique key using texture UUID + map type
            const key = `${texture.uuid}_${mapName}`
            if (!textureMap.has(key)) {
              textureMap.set(key, {
                texture,
                mapType: mapName,
                materialName: material.name
              })
            }
          }
        })
      })
    }
  })

  // Process textures asynchronously
  for (const { texture, mapType, materialName } of textureMap.values()) {
    try {
      const textureInfo = await getTextureInfo(texture, mapType, materialName)
      textureInfos.push(textureInfo)
    } catch (error) {
      console.warn('Failed to process texture:', error)
      // Add a fallback texture info
      textureInfos.push({
        name: texture.name || `${mapType}_texture`,
        mapType,
        mapTypeLabel: formatMapType(mapType),
        format: getTextureFormat(texture.format),
        type: getTextureType(texture.type),
        wrapS: getWrapMode(texture.wrapS),
        wrapT: getWrapMode(texture.wrapT),
        magFilter: getFilterMode(texture.magFilter),
        minFilter: getFilterMode(texture.minFilter),
        flipY: texture.flipY,
        generateMipmaps: texture.generateMipmaps,
        texture,
        dataUrl: createPlaceholderDataUrl(formatMapType(mapType))
      })
    }
  }

  return textureInfos
}

export function formatMapType(mapName: string): string {
  const mapLabels: { [key: string]: string } = {
    map: 'Diffuse/Albedo',
    normalMap: 'Normal',
    emissiveMap: 'Emissive',
    metalnessMap: 'Metalness',
    roughnessMap: 'Roughness',
    aoMap: 'Ambient Occlusion',
    alphaMap: 'Alpha',
    envMap: 'Environment',
    lightMap: 'Light Map',
    bumpMap: 'Bump',
    displacementMap: 'Displacement'
  }
  return mapLabels[mapName] || mapName
}

// %%%%%LAST%%%%%