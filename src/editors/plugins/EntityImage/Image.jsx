function ImageC (props) {
  return <img {...props} className="h-full w-full object-contain" />
}

const ImageComponent = (props) => <ImageC {...props} />

export default ImageComponent
