const log = {}
const typeList = [
  { type: 'primary', color: '#ff4d4f' },
  { type: 'info', color: '#35495E' }
]
typeList.forEach((res) => {
  log[res.type] = function (title, text) {
    console.log(`%c ${title} %c ${text} %c`, `background:${res.color};border:1px solid ${res.color}; padding: 1px; border-radius: 2px 0 0 2px; color: #fff;`, `border:1px solid ${res.color}; padding: 1px; border-radius: 0 2px 2px 0; color: ${res.color};`, 'background:transparent')
  }
})
export default log
