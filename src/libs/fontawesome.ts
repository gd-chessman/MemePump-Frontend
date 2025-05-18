import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faHome,
  faUser,
  faEnvelope,
  faPhone,
  faSearch,
  faBars,
  faTimes,
  faChevronDown,
  faChevronUp,
  faChevronLeft,
  faChevronRight,
  faStar,
  faHeart,
  faShoppingCart,
  faBell,
  faCog,
  faSignOutAlt,
  faPlus,
  faMinus,
  faCheck,
  faTimes as faXmark,
  faInfoCircle,
  faExclamationTriangle,
  faQuestionCircle,
  faCheckCircle,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
library.add(
  faHome,
  faUser,
  faEnvelope,
  faPhone,
  faSearch,
  faBars,
  faTimes,
  faChevronDown,
  faChevronUp,
  faChevronLeft,
  faChevronRight,
  faStar,
  faHeart,
  faShoppingCart,
  faBell,
  faCog,
  faSignOutAlt,
  faPlus,
  faMinus,
  faCheck,
  faXmark,
  faInfoCircle,
  faExclamationTriangle,
  faQuestionCircle,
  faCheckCircle,
  faExclamationCircle,
)

// Export a function to initialize FontAwesome
export function initFontAwesome() {
  // This function can be called in a useEffect in your app
  if (typeof window !== 'undefined') {
    require('@fortawesome/fontawesome-svg-core/styles.css')
  }
} 