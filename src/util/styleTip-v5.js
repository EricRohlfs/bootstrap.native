import tipClassPositions from './tipClassPositions.js'
import isMedia from './isMedia.js'

export default function(link,element,position,parent,e) { // both popovers and tooltips (target,tooltip,placement,elementToAppendTo)
  let tipClasses = /\b(top|bottom|start|end)+/,
      elementDimensions = { w : element.offsetWidth, h: element.offsetHeight },
      windowWidth = ( document.documentElement.clientWidth || document.body.clientWidth ),
      windowHeight = ( document.documentElement.clientHeight || document.body.clientHeight ),
      rect = link.getBoundingClientRect(),
      scroll = parent === document.body 
              ? { x: window.pageXOffset, y: window.pageYOffset } 
              : { x: parent.offsetLeft + parent.scrollLeft, y: parent.offsetTop + parent.scrollTop },
      linkDimensions = { w: rect.right - rect.left, h: rect.bottom - rect.top },
      isPopover = element.classList.contains( 'popover' ),
      arrow = element.getElementsByClassName( `${isPopover?'popover':'tooltip'}-arrow` )[0],
      topPosition, leftPosition,
      arrowTop, arrowLeft, arrowWidth, arrowHeight,
      // check position
      halfTopExceed = rect.top + linkDimensions.h/2 - elementDimensions.h/2 < 0,
      halfLeftExceed = rect.left + linkDimensions.w/2 - elementDimensions.w/2 < 0,
      halfRightExceed = rect.left + elementDimensions.w/2 + linkDimensions.w/2 >= windowWidth,
      halfBottomExceed = rect.top + elementDimensions.h/2 + linkDimensions.h/2 >= windowHeight,
      topExceed = rect.top - elementDimensions.h < 0,
      leftExceed = rect.left - elementDimensions.w < 0,
      bottomExceed = rect.top + elementDimensions.h + linkDimensions.h >= windowHeight,
      rightExceed = rect.left + elementDimensions.w + linkDimensions.w >= windowWidth,
      arrowAdjust = 0

  // recompute position
  // first, when both left and right limits are exceeded, we fall back to top|bottom
  position = ( position === 'left' || position === 'right' ) && leftExceed && rightExceed ? 'top' : position 
  position = position === 'top' && topExceed ? 'bottom' : position
  position = position === 'bottom' && bottomExceed ? 'top' : position
  position = position === 'left' && leftExceed ? 'right' : position
  position = position === 'right' && rightExceed ? 'left' : position

  // update tooltip/popover class
  element.className.indexOf(position) === -1 
    && ( element.className = element.className.replace( tipClasses, tipClassPositions[position] ) )

  // we check the computed width & height and update here
  arrowWidth = arrow ? arrow.offsetWidth : 0
  arrowHeight = arrow ? arrow.offsetHeight : 0
  arrowAdjust = ( isPopover ? arrowWidth*0.8 : arrowWidth/2 )

  // apply styling to tooltip / popover
  if ( position === 'left' || position === 'right' ) { // secondary|side positions
    if ( position === 'left' ) { // LEFT
      leftPosition = rect.left + scroll.x - elementDimensions.w - ( isPopover ? arrowWidth : 0 )
    } else { // RIGHT
      leftPosition = rect.left + scroll.x + linkDimensions.w
    }

    // adjust top and arrow
    if ( halfTopExceed ) {
      topPosition = rect.top + scroll.y
      arrowTop = linkDimensions.h/2 - arrowWidth
    } else if ( halfBottomExceed ) {
      topPosition = rect.top + scroll.y - elementDimensions.h + linkDimensions.h
      arrowTop = elementDimensions.h - linkDimensions.h/2 - arrowWidth
    } else {
      topPosition = rect.top + scroll.y - elementDimensions.h/2 + linkDimensions.h/2
      arrowTop = elementDimensions.h/2 - ( isPopover ? arrowHeight*0.9 : arrowHeight/2 )
    }
    arrowLeft = null

  } else if ( position === 'top' || position === 'bottom' ) {

    if ( e && isMedia(link) ) {

      if ( position === 'top' ) {
        topPosition = e.pageY - elementDimensions.h - ( isPopover ? arrowWidth : arrowHeight )
      } else {
        topPosition = e.pageY + arrowHeight
      }

      // adjust left | right and also the arrow
      if (e.clientX - elementDimensions.w/2 < 0) {
        leftPosition = 0
        // arrowLeft = e.pageX - arrowWidth/2
        arrowLeft = e.pageX - ( isPopover ? arrowWidth*0.8 : arrowWidth/2 )
      } else if (e.clientX + elementDimensions.w * 0.51 > windowWidth) {
        leftPosition = windowWidth - elementDimensions.w * 1.009
        // arrowLeft = elementDimensions.w - (windowWidth - e.pageX) - arrowWidth/2
        arrowLeft = elementDimensions.w - (windowWidth - e.pageX) - arrowAdjust
      } else {
        leftPosition = e.pageX - elementDimensions.w/2
        arrowLeft = elementDimensions.w/2 - ( isPopover ? arrowWidth*0.8 : arrowWidth/2 )
        // arrowLeft = elementDimensions.w/2 - arrowWidth/2
      }

    } else {

      if ( position === 'top' ) {
        topPosition =  rect.top + scroll.y - elementDimensions.h - ( isPopover ? arrowHeight : 0 )
      } else { // BOTTOM
        topPosition = rect.top + scroll.y + linkDimensions.h
      }

      // adjust left | right and also the arrow
      if ( halfLeftExceed ) {
        leftPosition = 0
        arrowLeft = rect.left + linkDimensions.w/2 - ( isPopover ? arrowWidth*0.8 : arrowWidth/2 )
      } else if ( halfRightExceed ) {
        leftPosition = windowWidth - elementDimensions.w
        arrowLeft = elementDimensions.w - ( windowWidth - rect.left ) + linkDimensions.w/2 - ( isPopover ? arrowWidth*0.8 : arrowWidth/2 )
      } else {
        leftPosition = rect.left + scroll.x - elementDimensions.w/2 + linkDimensions.w/2
        arrowLeft = elementDimensions.w/2 - ( isPopover ? arrowWidth*0.8 : arrowWidth/2 )
      }
    }
    arrowTop = null

  }

  // apply style to tooltip/popover and its arrow
  element.style.top = topPosition + 'px';
  element.style.left = leftPosition + 'px';

  // update arrow position or clear side
  arrowTop !== null ? (arrow.style.top = arrowTop + 'px') : (arrow.style.top = '')
  arrowLeft !== null ? (arrow.style.left = arrowLeft + 'px') : (arrow.style.left = '')
}