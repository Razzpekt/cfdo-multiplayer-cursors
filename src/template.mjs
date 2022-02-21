const template = `
<style>
  html,
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    background-color: slategray;
  }
  * {
    cursor: none !important;
  }

  .cursor {
    display: flex;
    position: absolute;
    font-family: Inter, sans-serif;
    font-size: 11px;
    font-weight: 400;
    line-height: 1em;
    cursor: pointer;
    transition: opacity 0.3s ease;
    will-change: transform;
    overflow: visible;
  }
  .user-info {
    vertical-align: 1px;
    margin-left: -9px;
    margin-top: 20px;
  }
  .avatar {
    border-radius: 50%;
    width: 28px;
    height: 28px;
  }
  .message {
    display: flex;
    color: #000;
    font-size: 14px;
    padding: 6px;
    border-radius: 22px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    line-height: 1.4em;
    transition: padding 0.1s ease, border-radius 0.1s ease;
  }
  .message.empty {
    border-radius: 18px;
    padding: 2px;
    transition: padding 0.3s ease, border-radius 0.3s ease;
  }
</style>
<div id="cursors">
  <div
    id="cursor"
    class="cursor"
    style="transform: translate3d(487.28404017857144px, 159.96341463414635px, 0px);"
  >
    <div>
      <svg
        width="33"
        height="33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d)" opacity="1">
          <path
            d="M9.63 6.9a1 1 0 011.27-1.27l11.25 3.75a1 1 0 010 1.9l-4.68 1.56a1 1 0 00-.63.63l-1.56 4.68a1 1 0 01-1.9 0L9.63 6.9z"
            fill="#ff0080"
          ></path>
          <path
            d="M11.13 4.92a1.75 1.75 0 00-2.2 2.21l3.74 11.26a1.75 1.75 0 003.32 0l1.56-4.68a.25.25 0 01.16-.16L22.4 12a1.75 1.75 0 000-3.32L11.13 4.92z"
            stroke="#fff"
            stroke-width="1.5"
          ></path>
        </g>
        <defs>
          <filter
            id="filter0_d"
            x=".08"
            y=".08"
            width="32.26"
            height="32.26"
            filterUnits="userSpaceOnUse"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
            <feColorMatrix
              in="SourceAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            ></feColorMatrix>
            <feOffset dy="4"></feOffset>
            <feGaussianBlur stdDeviation="4"></feGaussianBlur>
            <feColorMatrix
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
            ></feColorMatrix>
            <feBlend
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            ></feBlend>
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            ></feBlend>
          </filter>
        </defs>
      </svg>
    </div>
    <div class="user-info">
      <div class="message empty" style="background-color: rgb(255, 0, 128);">
        <img
          src="https://unsplash.it/50"
          class="avatar"
          style="color: rgb(255, 0, 128);"
        />
        <div
          class="collaborator_content__3ADbj"
          style="width: 0px; height: 0px;"
        >
          <span></span>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  let ws

  async function websocket(url) {
    ws = new WebSocket(url)

    if (!ws) {
      throw new Error("server didn't accept ws")
    }

    ws.addEventListener('open', () => {
      console.log('Opened websocket')
      ws.send(JSON.stringify({ type: 'getState' }))
    })

    ws.addEventListener('message', ({ data }) => {
      console.log(data);
      const { type, ...other } = JSON.parse(data)
      switch (type) {
        case "cursorAdded":
          createCursor(other.cursor)
          break;
        case 'gotState':
          // Create cursors, place them
          console.log(other.state)
          if (Array.isArray(other.state)) {
            other.state.forEach(cursor => {
              createCursor(cursor)
            })
          }
          break;
        case 'cursorsMoved':
          // Move each of the cursors
          if (Array.isArray(other.movedCursors)) {
            other.movedCursors.forEach(cursor => {
              moveCursor(cursor)
            })
          }
          break;
        case 'cursorRemoved':
          removeCursor(other.id)
          break;
      }
    })
  }

  const url = new URL(window.location)
  url.protocol = 'wss'
  url.pathname = '/ws'
  websocket(url)

  window.onbeforeunload = function() {
    ws.onclose = function () {}; // disable onclose handler first
    ws.close();
  };

  document.addEventListener('mousemove', event => {
    const position = { x: event.clientX, y: event.clientY }
    const element = document.getElementById('cursor')
    element.style.transform = \`translate3d(\${position.x}px, \${position.y}px, 0)\`
    const positions = {
      x: position.x / window.innerWidth,
      y: position.y / window.innerWidth,
    }
    // console.log({ positions })
    ws.send(
      JSON.stringify({
        type: 'cursorMoved',
        x: position.x / window.innerWidth,
        y: position.y / window.innerWidth,
      }),
    )
  })

  const cursorTemplate = \`
  <div>
    <svg width="33" height="33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d)" opacity="1">
        <path d="M9.63 6.9a1 1 0 011.27-1.27l11.25 3.75a1 1 0 010 1.9l-4.68 1.56a1 1 0 00-.63.63l-1.56 4.68a1 1 0 01-1.9 0L9.63 6.9z" fill="#ff0080"></path>
        <path d="M11.13 4.92a1.75 1.75 0 00-2.2 2.21l3.74 11.26a1.75 1.75 0 003.32 0l1.56-4.68a.25.25 0 01.16-.16L22.4 12a1.75 1.75 0 000-3.32L11.13 4.92z" stroke="#fff" stroke-width="1.5"></path>
      </g>
      <defs>
        <filter id="filter0_d" x=".08" y=".08" width="32.26" height="32.26" filterUnits="userSpaceOnUse">
          <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
          <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix>
          <feOffset dy="4"></feOffset>
          <feGaussianBlur stdDeviation="4"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"></feColorMatrix>
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow"></feBlend>
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"></feBlend>
        </filter>
      </defs>
    </svg></div>
  <div class="user-info">
    <div class="message empty" style="background-color: rgb(255, 0, 128);"><img src="https://unsplash.it/50" class="avatar" style="color: rgb(255, 0, 128);">
      <div class="collaborator_content__3ADbj" style="width: 0px; height: 0px;"><span></span></div>
    </div>
  </div>\`

  function createCursor({ id, x, y }) {
    const cursorDiv = document.createElement('div')
    Object.assign(cursorDiv, {
      innerHTML: cursorTemplate,
      id
    })
    Object.assign(cursorDiv.style, {
      
        transform: \`translate(\${x * window.innerWidth}px, \${y *
          window.innerHeight}px)\`,      
    })

    document.getElementById('cursors').append(cursorDiv)
  }

  function removeCursor(id) {
    document.getElementById(id)?.remove()
  }

  function moveCursor({id, x, y}) {
    const el =  document.getElementById(id);
    if (!el) {
      console.error('did not find id: ' + id);
      return;
    }
    el.style.transform = \`translate(\${x *
      window.innerWidth}px, \${y * window.innerHeight}px)\`
  }
</script>

`

export default () => {
  return new Response(template, {
    headers: {
      'Content-type': 'text/html; charset=utf-8',
    },
  })
}
