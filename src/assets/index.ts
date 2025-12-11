// Asset imports and exports
// Images and videos for the application

// Images
export const images = {
  placeholderLogo: new URL('./images/placeholder-logo.png', import.meta.url).href,
  placeholderLogoSvg: new URL('./images/placeholder-logo.svg', import.meta.url).href,
  placeholderUser: new URL('./images/placeholder-user.jpg', import.meta.url).href,
  placeholder: new URL('./images/placeholder.jpg', import.meta.url).href,
  placeholderSvg: new URL('./images/placeholder.svg', import.meta.url).href,
}

// Videos
export const videos = {
  vehi: new URL('./videos/vehi.mp4', import.meta.url).href,
}

export const assets = {
  images,
  videos,
}

export default assets
