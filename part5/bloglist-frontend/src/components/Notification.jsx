const Notification = ({ message, type }) => {
  const style_ = {
    background: type === 'error' ? 'lightcoral' : 'lightgrey',
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
  }
  if (message === null) {
    return null
  }
  return (
    <div style={style_} data-testid='notification'>
      {message}
    </div>
  )
}

export default Notification