import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";

const EnvelopeIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 512 512">
    <path d="M339.392 258.624L512 367.744 512 144.896z"></path>
    <path d="M0 144.896L0 367.744 172.608 258.624z"></path>
    <path d="M480 80H32C16.032 80 3.36 91.904.96 107.232L256 275.264l255.04-168.032C508.64 91.904 495.968 80 480 80zM310.08 277.952l-45.28 29.824a15.983 15.983 0 01-8.8 2.624c-3.072 0-6.112-.864-8.8-2.624l-45.28-29.856L1.024 404.992C3.488 420.192 16.096 432 32 432h448c15.904 0 28.512-11.808 30.976-27.008L310.08 277.952z"></path>
  </svg>
);

const CheckIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 18.7 18.7">
    <path d="M9.42 0C4.26-.04.04 4.11 0 9.28c-.04 5.16 4.11 9.38 9.28 9.42 5.16.04 9.38-4.11 9.42-9.28v-.07C18.72 4.21 14.56.02 9.42 0m-1.9 14.33L2.76 9.54 4.09 8.2l3.42 3.45 7.23-7.28 1.33 1.34-8.55 8.62z"></path>
  </svg>
);

const CloseIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 512 512">
    <path
      d="M256,0C114.508,0,0,114.497,0,256c0,141.493,114.497,256,256,256c141.492,0,256-114.497,256-256
        C512,114.507,397.503,0,256,0z M256,472c-119.384,0-216-96.607-216-216c0-119.385,96.607-216,216-216
        c119.384,0,216,96.607,216,216C472,375.385,375.393,472,256,472z"
    />
    <path
      d="M343.586,315.302L284.284,256l59.302-59.302c7.81-7.81,7.811-20.473,0.001-28.284c-7.812-7.811-20.475-7.81-28.284,0
        L256,227.716l-59.303-59.302c-7.809-7.811-20.474-7.811-28.284,0c-7.81,7.811-7.81,20.474,0.001,28.284L227.716,256
        l-59.302,59.302c-7.811,7.811-7.812,20.474-0.001,28.284c7.813,7.812,20.476,7.809,28.284,0L256,284.284l59.303,59.302
        c7.808,7.81,20.473,7.811,28.284,0C351.398,335.775,351.397,323.112,343.586,315.302z"
    />
  </svg>
);

const SearchIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 22 22">
    <path d="M16.11 13.19c2.49-4.1 1.18-9.44-2.92-11.93S3.75.08 1.26 4.18.08 13.62 4.18 16.11a8.684 8.684 0 009.01 0L19.08 22 22 19.08l-5.89-5.89zm-7.4.88c-2.96 0-5.36-2.4-5.35-5.36 0-2.96 2.4-5.36 5.36-5.35 2.96 0 5.36 2.4 5.35 5.36 0 2.96-2.4 5.35-5.36 5.35z"></path>
  </svg>
);

const PlusIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 448 448">
    <path
      d="m408 184h-136c-4.417969 0-8-3.582031-8-8v-136c0-22.089844-17.910156-40-40-40s-40 17.910156-40 40v136c0
        4.417969-3.582031 8-8 8h-136c-22.089844 0-40 17.910156-40 40s17.910156 40 40 40h136c4.417969 0 8 3.582031 8
        8v136c0 22.089844 17.910156 40 40 40s40-17.910156 40-40v-136c0-4.417969 3.582031-8 8-8h136c22.089844 0
        40-17.910156 40-40s-17.910156-40-40-40zm0 0"
    />
  </svg>
);

const MinusIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 124 124">
    <path d="M112,50H12C5.4,50,0,55.4,0,62c0,6.6,5.4,12,12,12h100c6.6,0,12-5.4,12-12C124,55.4,118.6,50,112,50z" />
  </svg>
);

const StatsIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <path d="M0 0v30h30v-3.33H3.33V0H0z"></path>
    <path d="M6.67 13.37H9.99V23.32H6.67z"></path>
    <path d="M13.34 3.32H16.66V23.22H13.34z"></path>
    <path d="M20.01 10.04H23.330000000000002V23.31H20.01z"></path>
    <path d="M26.68 16.69H30V23.32H26.68z"></path>
  </svg>
);

const FilterIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 512 512">
    <g>
      <path
        d="m187.304 252.717c8.045 11.642 5.64 1.941 5.64 233.997 0 20.766 23.692 32.651 40.39 20.23 71.353-53.797
          85.609-58.456 85.609-83.619 0-169.104-1.971-159.594 5.64-170.608l115.869-157.718h-369.016z"
      />
      <path
        d="m484.221 12.86c-4.14-7.93-12.26-12.86-21.199-12.86h-414.156c-19.305 0-30.664 21.777-19.59
          37.6.091.152-1.257-1.693 20.12 27.4h413.095c18.217-24.793 30.394-35.505 21.73-52.14z"
      />
    </g>
  </svg>
);

const DownloadIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <path d="M12.66 0h4.69c.77 0 1.4.62 1.41 1.4v9.85h5.14c.65 0 1.17.52 1.17 1.17 0 .31-.12.61-.34.83l-8.91 8.92c-.44.44-1.16.44-1.6 0l-8.94-8.92c-.46-.46-.46-1.2 0-1.65.22-.22.52-.34.83-.34h5.14V1.41c0-.78.62-1.41 1.4-1.41zM30 22.03v6.56c0 .77-.62 1.4-1.4 1.41H1.41A1.4 1.4 0 010 28.6v-6.56c0-.77.62-1.4 1.4-1.41H10l2.87 2.87a3 3 0 004.24.01l.01-.01 2.87-2.87h8.59c.77 0 1.4.62 1.41 1.4zm-7.27 5.16c0-.65-.52-1.17-1.17-1.17s-1.17.52-1.17 1.17.52 1.17 1.17 1.17c.65 0 1.17-.53 1.17-1.17zm3.75 0c0-.65-.52-1.17-1.17-1.17s-1.17.52-1.17 1.17.52 1.17 1.17 1.17c.65 0 1.17-.53 1.17-1.17z"></path>
  </svg>
);

function InfoIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 45.999 45.999">
      <path
        d="M39.264,6.736c-8.982-8.981-23.545-8.982-32.528,0c-8.982,8.982-8.981,23.545,0,32.528c8.982,8.98,23.545,8.981,32.528,0
        C48.245,30.281,48.244,15.719,39.264,6.736z M25.999,33c0,1.657-1.343,3-3,3s-3-1.343-3-3V21c0-1.657,1.343-3,3-3s3,1.343,3,3V33z
        M22.946,15.872c-1.728,0-2.88-1.224-2.844-2.735c-0.036-1.584,1.116-2.771,2.879-2.771c1.764,0,2.88,1.188,2.917,2.771
        C25.897,14.648,24.746,15.872,22.946,15.872z"
      />
    </svg>
  );
}

const LayerIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 18.84 18.84">
    <path d="M.46 5.45l8.57 3.89c.25.11.53.11.78 0l8.57-3.89c.41-.2.57-.69.37-1.1a.828.828 0 00-.37-.37L9.81.09a.963.963 0 00-.78 0L.46 3.97c-.41.2-.57.69-.37 1.1.08.16.21.29.37.37zM18.38 8.7l-2.14-.97-5.95 2.7c-.56.25-1.2.25-1.76 0l-5.94-2.7-2.14.97c-.41.2-.57.69-.37 1.1.08.16.21.29.37.37l8.57 3.89c.25.11.53.11.78 0l8.57-3.89c.41-.2.57-.69.37-1.1a.828.828 0 00-.37-.37zm0 4.7l-2.13-.97-5.96 2.7c-.56.25-1.2.25-1.76 0l-5.95-2.7-2.13.97c-.41.2-.57.69-.37 1.1.08.16.21.29.37.37l8.57 3.89c.25.11.53.11.78 0l8.57-3.89c.41-.2.57-.69.37-1.1a.828.828 0 00-.37-.37z" />
  </svg>
);

const DownIcon = ({ size }) => (
  <svg viewBox="0 0 512 512">
    <path
      d="M98.9,184.7l1.8,2.1l136,156.5c4.6,5.3,11.5,8.6,19.2,8.6c7.7,0,14.6-3.4,19.2-8.6L411,187.1l2.3-2.6
        c1.7-2.5,2.7-5.5,2.7-8.7c0-8.7-7.4-15.8-16.6-15.8v0H112.6v0c-9.2,0-16.6,7.1-16.6,15.8C96,179.1,97.1,182.2,98.9,184.7z"
    />
  </svg>
);

const UserIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 16.2 16.2">
    <path d="M8.1 8.1c2.24 0 4.05-1.81 4.05-4.05C12.15 1.82 10.34 0 8.1 0S4.05 1.81 4.05 4.05c0 2.23 1.82 4.04 4.05 4.05zm0 2.03c-2.68 0-8.1 1.37-8.1 4.05v2.03h16.2v-2.02c0-2.68-5.42-4.05-8.1-4.05z"></path>
  </svg>
);

const MineIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 512 512">
    <path
      d="M501.856,267.118c-11.311-38.168-31.9-73.311-59.634-101.848l8.224-8.224c5.768-5.768,5.768-15.12,0-20.888
        l-74.602-74.602c-5.767-5.768-15.12-5.768-20.888,0l-8.224,8.224c-28.538-27.735-63.681-48.324-101.849-59.635
        c-39.279-11.642-81.225-13.299-121.3-4.791c-6.758,1.435-11.619,7.361-11.703,14.27c-0.084,6.907,4.632,12.95,11.352,14.548
        l14.46,3.437c39.139,9.304,74.863,29.257,103.31,57.704l40.098,40.098l-4.476,4.476c-5.768,5.768-5.768,15.12,0,20.888
        l74.602,74.602c5.767,5.768,15.12,5.768,20.888,0l4.476-4.476l40.098,40.098c28.446,28.447,48.4,64.17,57.704,103.308l3.437,14.46
        c1.583,6.662,7.536,11.354,14.367,11.354c0.061,0,0.12,0,0.181-0.001c6.907-0.084,12.835-4.944,14.269-11.702
        C515.153,348.342,513.497,306.397,501.856,267.118z"
    />
    <path
      d="M260.211,186.14L4.326,442.025c-5.768,5.768-5.768,15.12,0,20.888l44.761,44.761c2.884,2.884,6.664,4.327,10.443,4.327
        c3.779,0,7.56-1.441,10.443-4.327l255.885-255.885L260.211,186.14z"
    />
  </svg>
);

const AdminIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <path
      fill="#fff"
      d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"
    />
  </svg>
);

const LanguageIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 18 18">
    <path
      id="uuid-aa08bb1a-3b46-4c6f-9522-6d369ff9458f"
      d="M8.99,0C4.02,0,0,4.04,0,9.01s4.04,9,9.01,8.99c4.97,0,8.99-4.03,8.99-9C18,4.03,13.97,0,9,0c0,0,0,0,0,0Zm6.24,5.4h-2.66c-.28-1.11-.7-2.19-1.24-3.2,1.64,.56,3.02,1.7,3.9,3.2ZM9,1.84c.76,1.09,1.34,2.29,1.72,3.56h-3.44c.38-1.27,.96-2.47,1.72-3.56ZM2.03,10.8c-.31-1.18-.31-2.42,0-3.6h3.04c-.08,.6-.12,1.2-.13,1.8,0,.6,.05,1.2,.13,1.8H2.03Zm.74,1.8h2.66c.28,1.11,.7,2.19,1.24,3.2-1.64-.56-3.03-1.7-3.9-3.2Zm2.66-7.2H2.77c.87-1.5,2.26-2.64,3.9-3.2-.54,1.01-.96,2.09-1.24,3.2Zm3.57,10.76c-.76-1.09-1.34-2.29-1.72-3.56h3.44c-.38,1.27-.96,2.47-1.72,3.56Zm2.11-5.36H6.89c-.09-.6-.14-1.2-.14-1.8,0-.6,.05-1.2,.14-1.8h4.21c.09,.6,.14,1.2,.14,1.8,0,.6-.06,1.2-.14,1.8Zm.23,5c.54-1.01,.96-2.09,1.24-3.2h2.66c-.87,1.5-2.26,2.64-3.9,3.2h0Zm1.59-5c.08-.6,.12-1.2,.13-1.8,0-.6-.05-1.2-.13-1.8h3.04c.31,1.18,.31,2.42,0,3.6h-3.04Z"
    />
  </svg>
);

const EnglishLanguageIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 21 20.011">
    <defs>
      <clipPath id="clip-path">
        <rect
          id="Rectangle_11884"
          data-name="Rectangle 11884"
          width="20"
          height="19.004"
          transform="translate(0 0)"
          fill="none"
        />
      </clipPath>
      <clipPath id="clip-path-2">
        <rect
          id="Rectangle_19"
          data-name="Rectangle 19"
          width="21"
          height="20.011"
          transform="translate(0 0)"
          fill="none"
        />
      </clipPath>
    </defs>
    <g id="english-icon" transform="translate(0.5 0.503)">
      <g id="Group_220" data-name="Group 220" clip-path="url(#clip-path)">
        <path
          id="Path_959"
          data-name="Path 959"
          d="M12.7,16.189a10.558,10.558,0,0,0,2.523-.953L12.7,13.6Z"
          fill="#002581"
        />
        <path
          id="Path_960"
          data-name="Path 960"
          d="M3.554,16.034a4.02,4.02,0,0,1-2.3,2.438V19A10.461,10.461,0,0,0,7.3,17.333V13.615Z"
          fill="#002581"
        />
        <path
          id="Path_961"
          data-name="Path 961"
          d="M.5,5.714C.466,5.807.431,5.9.4,5.995h.54Z"
          fill="#002581"
        />
        <path
          id="Path_962"
          data-name="Path 962"
          d="M7.3.278a10.39,10.39,0,0,0-4.437,2.26L7.3,5.405Z"
          fill="#002581"
        />
        <path
          id="Path_963"
          data-name="Path 963"
          d="M17.145,2.541A10.4,10.4,0,0,0,12.7.277v5.14Z"
          fill="#002581"
        />
        <path
          id="Path_964"
          data-name="Path 964"
          d="M19.6,5.995c-.033-.095-.068-.188-.1-.281l-.435.281Z"
          fill="#002581"
        />
        <path
          id="Path_965"
          data-name="Path 965"
          d="M2.184,5.995l-1.4-.9Q.627,5.4.5,5.714l.435.281Z"
          fill="#fff"
        />
        <path
          id="Path_966"
          data-name="Path 966"
          d="M2.184,5.995l-1.4-.9Q.627,5.4.5,5.714l.435.281Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_967"
          data-name="Path 967"
          d="M7.3,5.995V5.4L2.861,2.537A10.39,10.39,0,0,0,1.5,3.993l3.107,2Z"
          fill="#fff"
        />
        <path
          id="Path_968"
          data-name="Path 968"
          d="M7.3,5.995V5.4L2.861,2.537A10.39,10.39,0,0,0,1.5,3.993l3.107,2Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_969"
          data-name="Path 969"
          d="M1.837,13a7.886,7.886,0,0,0,1.089,1.088L4.608,13Z"
          fill="#fff"
        />
        <path
          id="Path_970"
          data-name="Path 970"
          d="M1.837,13a7.886,7.886,0,0,0,1.089,1.088L4.608,13Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_971"
          data-name="Path 971"
          d="M7.3,13H7.007L3.743,15.114c0,.032.007.064.007.1a4.054,4.054,0,0,1-.2.822L7.3,13.614Z"
          fill="#fff"
        />
        <path
          id="Path_972"
          data-name="Path 972"
          d="M7.3,13H7.007L3.743,15.114c0,.032.007.064.007.1a4.054,4.054,0,0,1-.2.822L7.3,13.614Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path id="Path_973" data-name="Path 973" d="M18,13.106,18.1,13h-.26Z" fill="#fff" />
        <path
          id="Path_974"
          data-name="Path 974"
          d="M18,13.106,18.1,13h-.26Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_975"
          data-name="Path 975"
          d="M12.7,13v.6l2.523,1.634a10.566,10.566,0,0,0,1.8-1.2L15.416,13Z"
          fill="#fff"
        />
        <path
          id="Path_976"
          data-name="Path 976"
          d="M12.7,13v.6l2.523,1.634a10.566,10.566,0,0,0,1.8-1.2L15.416,13Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_977"
          data-name="Path 977"
          d="M12.7,5.417v.578h.291L17.62,3.007c-.158-.156-.308-.321-.476-.466Z"
          fill="#fff"
        />
        <path
          id="Path_978"
          data-name="Path 978"
          d="M12.7,5.417v.578h.291L17.62,3.007c-.158-.156-.308-.321-.476-.466Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_979"
          data-name="Path 979"
          d="M19.062,5.995l.435-.281a6.974,6.974,0,0,0-.6-1.21c-.122-.177-.264-.335-.4-.5L15.417,5.995Z"
          fill="#fff"
        />
        <path
          id="Path_980"
          data-name="Path 980"
          d="M19.062,5.995l.435-.281a6.974,6.974,0,0,0-.6-1.21c-.122-.177-.264-.335-.4-.5L15.417,5.995Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_981"
          data-name="Path 981"
          d="M8.388,6.11V.092A10.439,10.439,0,0,0,7.3.278V5.405Z"
          fill="#fff"
        />
        <path
          id="Path_982"
          data-name="Path 982"
          d="M8.388,6.11V.092A10.439,10.439,0,0,0,7.3.278V5.405Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_983"
          data-name="Path 983"
          d="M12.7,5.417V.277A10.542,10.542,0,0,0,11.636.095V6.107Z"
          fill="#fff"
        />
        <path
          id="Path_984"
          data-name="Path 984"
          d="M12.7,5.417V.277A10.542,10.542,0,0,0,11.636.095V6.107Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_985"
          data-name="Path 985"
          d="M16.886,7.4h3.05A7.054,7.054,0,0,0,19.6,5.995h-.54Z"
          fill="#fff"
        />
        <path
          id="Path_986"
          data-name="Path 986"
          d="M16.886,7.4h3.05A7.054,7.054,0,0,0,19.6,5.995h-.54Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_987"
          data-name="Path 987"
          d="M18.44,12.622c.033-.041.071-.076.1-.117a7.326,7.326,0,0,0,.583-.911h-2.28Z"
          fill="#fff"
        />
        <path
          id="Path_988"
          data-name="Path 988"
          d="M18.44,12.622c.033-.041.071-.076.1-.117a7.326,7.326,0,0,0,.583-.911h-2.28Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_989"
          data-name="Path 989"
          d="M.938,5.995H.4A7.054,7.054,0,0,0,.064,7.4h3.05Z"
          fill="#fff"
        />
        <path
          id="Path_990"
          data-name="Path 990"
          d="M.938,5.995H.4A7.054,7.054,0,0,0,.064,7.4h3.05Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_991"
          data-name="Path 991"
          d="M11.636,12.911v3.468a10.8,10.8,0,0,0,1.066-.19V13.6Z"
          fill="#fff"
        />
        <path
          id="Path_992"
          data-name="Path 992"
          d="M11.636,12.911v3.468a10.8,10.8,0,0,0,1.066-.19V13.6Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_993"
          data-name="Path 993"
          d="M7.3,13.614v3.718a8.337,8.337,0,0,0,1.091-.907V12.909Z"
          fill="#fff"
        />
        <path
          id="Path_994"
          data-name="Path 994"
          d="M7.3,13.614v3.718a8.337,8.337,0,0,0,1.091-.907V12.909Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_995"
          data-name="Path 995"
          d="M.9,11.594a7.79,7.79,0,0,0,.641,1.042l1.612-1.042Z"
          fill="#fff"
        />
        <path
          id="Path_996"
          data-name="Path 996"
          d="M.9,11.594a7.79,7.79,0,0,0,.641,1.042l1.612-1.042Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_997"
          data-name="Path 997"
          d="M8.388,6.11,7.3,5.4V6H.938L3.114,7.4H8.388Z"
          fill="#fff"
        />
        <path
          id="Path_998"
          data-name="Path 998"
          d="M8.388,6.11,7.3,5.4V6H.938L3.114,7.4H8.388Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_999"
          data-name="Path 999"
          d="M11.636,7.4h5.25L19.062,6H12.7V5.417l-1.066.69Z"
          fill="#fff"
        />
        <path
          id="Path_1000"
          data-name="Path 1000"
          d="M11.636,7.4h5.25L19.062,6H12.7V5.417l-1.066.69Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_1001"
          data-name="Path 1001"
          d="M11.636,11.594v1.318l1.066.69V13h5.4c.114-.126.232-.247.34-.378l-1.591-1.028Z"
          fill="#fff"
        />
        <path
          id="Path_1002"
          data-name="Path 1002"
          d="M11.636,11.594v1.318l1.066.69V13h5.4c.114-.126.232-.247.34-.378l-1.591-1.028Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_1003"
          data-name="Path 1003"
          d="M7.007,13H7.3v.615l1.09-.7V11.593H3.151L1.539,12.635c.093.126.2.244.3.364h5.17Z"
          fill="#fff"
        />
        <path
          id="Path_1004"
          data-name="Path 1004"
          d="M7.007,13H7.3v.615l1.09-.7V11.593H3.151L1.539,12.635c.093.126.2.244.3.364h5.17Z"
          fill="none"
          stroke="#fff"
          stroke-width="0.073"
        />
        <path
          id="Path_1005"
          data-name="Path 1005"
          d="M15.417,5.995,18.5,4a10.373,10.373,0,0,0-.885-.994L12.993,5.995Z"
          fill="#bd061b"
        />
        <path
          id="Path_1006"
          data-name="Path 1006"
          d="M4.608,13,2.926,14.087a8.107,8.107,0,0,0,.782.556,3.7,3.7,0,0,1,.035.471L7.007,13Z"
          fill="#bd061b"
        />
        <path
          id="Path_1007"
          data-name="Path 1007"
          d="M15.417,13l1.6,1.04A10.569,10.569,0,0,0,18,13.1L17.84,13Z"
          fill="#bd061b"
        />
        <path
          id="Path_1008"
          data-name="Path 1008"
          d="M4.608,5.995l-3.107-2c-.133.171-.277.331-.4.511s-.216.388-.317.586l1.4.9Z"
          fill="#bd061b"
        />
        <path
          id="Path_1009"
          data-name="Path 1009"
          d="M10.012,11.86,8.388,12.909v3.516c.017-.017.036-.03.053-.047a12.133,12.133,0,0,0,1.559.1,10.48,10.48,0,0,0,1.636-.1V12.911Z"
          fill="#e50019"
        />
        <path
          id="Path_1010"
          data-name="Path 1010"
          d="M13.623,9.51l3.226,2.084h2.278A7.137,7.137,0,0,0,20,8.242a6.908,6.908,0,0,0-.065-.84H16.886Z"
          fill="#e50019"
        />
        <path
          id="Path_1011"
          data-name="Path 1011"
          d="M10.012,7.159l1.624-1.051V.1A10.472,10.472,0,0,0,10,0,10.409,10.409,0,0,0,8.388.092V6.11Z"
          fill="#e50019"
        />
        <path
          id="Path_1012"
          data-name="Path 1012"
          d="M6.377,9.51,3.114,7.4H.065A6.941,6.941,0,0,0,0,8.244a7.838,7.838,0,0,0,.9,3.35H3.151Z"
          fill="#e50019"
        />
        <path
          id="Path_1013"
          data-name="Path 1013"
          d="M11.636,6.108,10.012,7.159,8.389,6.11V7.4H3.114L6.377,9.51,3.151,11.594H8.389V12.91l1.623-1.049,1.624,1.051V11.594h5.213L13.623,9.51,16.886,7.4h-5.25Z"
          fill="#e50019"
        />
      </g>
      <g id="english-icon-2" data-name="english-icon" transform="translate(-0.5 -0.503)">
        <g id="Group_80" data-name="Group 80" transform="translate(0 0)">
          <g id="Group_79" data-name="Group 79" clip-path="url(#clip-path-2)">
            <path
              id="Path_13"
              data-name="Path 13"
              d="M19.4,5A10.393,10.393,0,0,0,10.5.5,10.394,10.394,0,0,0,1.6,5,7.059,7.059,0,0,0,.5,8.739a7.864,7.864,0,0,0,3.708,6.4,3.857,3.857,0,0,1,.042.568,4.025,4.025,0,0,1-2.5,3.26V19.5c2.479-.056,5.043-.448,7.191-2.626a12.133,12.133,0,0,0,1.559.1A10.57,10.57,0,0,0,19.045,13,7.151,7.151,0,0,0,20.5,8.737,7.054,7.054,0,0,0,19.4,5"
              fill="none"
            />
            <path
              id="Path_14"
              data-name="Path 14"
              d="M19.4,5A10.393,10.393,0,0,0,10.5.5,10.394,10.394,0,0,0,1.6,5,7.059,7.059,0,0,0,.5,8.739a7.864,7.864,0,0,0,3.708,6.4,3.857,3.857,0,0,1,.042.568,4.025,4.025,0,0,1-2.5,3.26V19.5c2.479-.056,5.043-.448,7.191-2.626a12.133,12.133,0,0,0,1.559.1A10.57,10.57,0,0,0,19.045,13,7.151,7.151,0,0,0,20.5,8.737,7.054,7.054,0,0,0,19.4,5Z"
              fill="none"
              stroke="#fff"
              stroke-miterlimit="10"
              stroke-width="1"
            />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

const SpanishLangaugeIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 21 20.01">
    <defs>
      <clipPath id="uuid-c0f33bb3-d8cd-4a76-840c-dff64916b8f4">
        <path fill="none" d="M0.03 0.72H20.34V20.009999999999998H0.03z"></path>
      </clipPath>
      <clipPath id="uuid-e2e25882-0a51-4174-bf7c-de42923ec559">
        <path fill="none" d="M0 0H21V20.01H0z"></path>
      </clipPath>
    </defs>
    <g clipPath="url(#uuid-c0f33bb3-d8cd-4a76-840c-dff64916b8f4)">
      <g>
        <path
          fill="#f8505c"
          d="M10.44.72C6.94.61 3.62 2.28 1.63 5.17h17.62C17.26 2.28 13.95.61 10.44.72"
        ></path>
        <path
          fill="#f8505c"
          d="M4.22 15.2c.03.19.04.37.04.56a3.992 3.992 0 01-2.47 3.23v.53c2.45-.06 4.99-.44 7.12-2.6.51.07 1.03.1 1.54.1 3.28.09 6.41-1.37 8.46-3.93H1.97c.6.85 1.36 1.57 2.25 2.12"
        ></path>
        <path
          fill="#ffda00"
          d="M19.25 5.17H1.64a7.038 7.038 0 00-1.09 3.7c.05 1.52.54 2.98 1.42 4.22H18.9a7.052 7.052 0 001.44-4.22c0-1.31-.39-2.59-1.09-3.7"
        ></path>
      </g>
    </g>
    <g clipPath="url(#uuid-e2e25882-0a51-4174-bf7c-de42923ec559)">
      <g fill="none">
        <path d="M19.4 5A10.404 10.404 0 0010.5.5C6.96.39 3.61 2.08 1.6 5A7.069 7.069 0 00.5 8.74a7.84 7.84 0 003.71 6.4c.03.19.04.38.04.57a4.018 4.018 0 01-2.5 3.26v.53c2.48-.06 5.04-.45 7.19-2.63.52.07 1.04.1 1.56.1 3.31.09 6.48-1.38 8.55-3.97a7.135 7.135 0 001.45-4.26c0-1.32-.39-2.62-1.1-3.74"></path>
        <path
          stroke="#fff"
          strokeMiterlimit="10"
          d="M19.4 5A10.404 10.404 0 0010.5.5C6.96.39 3.61 2.08 1.6 5A7.069 7.069 0 00.5 8.74a7.84 7.84 0 003.71 6.4c.03.19.04.38.04.57a4.018 4.018 0 01-2.5 3.26v.53c2.48-.06 5.04-.45 7.19-2.63.52.07 1.04.1 1.56.1 3.31.09 6.48-1.38 8.55-3.97a7.135 7.135 0 001.45-4.26c0-1.32-.39-2.62-1.1-3.74z"
        ></path>
      </g>
    </g>
  </svg>
);

const XIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20">
    <path d="M10 6.9L14.34 0h5.48l-6.74 9.92L20 20h-5.55L10 12.99 5.55 20H0L6.92 9.92.18 0h5.48L10 6.9z"></path>
  </svg>
);

const xMarkIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3.0}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3.0}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const checkMarkIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3.0}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ReturnExitIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0"
    y="0"
    width={size}
    height={size}
    enableBackground="new 0 0 206.108 206.108"
    version="1.1"
    viewBox="0 0 206.108 206.108"
    xmlSpace="preserve"
  >
    <path d="M152.774 69.886H30.728l24.97-24.97a9 9 0 000-12.728 9 9 0 00-12.729 0L2.636 72.523a9 9 0 000 12.728l40.333 40.333a8.97 8.97 0 006.364 2.636 9 9 0 006.364-15.364l-24.97-24.97h122.046c19.483 0 35.334 15.851 35.334 35.334s-15.851 35.334-35.334 35.334H78.531c-4.971 0-9 4.029-9 9s4.029 9 9 9h74.242c29.408 0 53.334-23.926 53.334-53.334s-23.925-53.334-53.333-53.334z"></path>
  </svg>
);

const TrashIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3.0}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);

const SettingsIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20">
    <path
      fill="#fff"
      d="M17.6 11c.04-.33.06-.67.05-1 0-.35-.05-.65-.05-1l2.15-1.65c.21-.15.25-.43.11-.64l-2.05-3.45a.497.497 0 00-.61-.2l-2.56 1c-.53-.41-1.12-.75-1.74-1L12.54.41a.546.546 0 00-.51-.4h-4.1c-.24 0-.45.17-.51.4l-.41 2.65c-.62.26-1.2.6-1.74 1l-2.56-1a.47.47 0 00-.61.2L.05 6.7c-.1.22-.06.47.1.65L2.35 9c0 .35-.05.65-.05 1s.05.65.05 1L.21 12.65c-.21.15-.25.43-.11.64l2.05 3.45c.13.21.39.29.61.2l2.56-1c.53.41 1.12.75 1.74 1l.41 2.65c.05.24.27.41.51.4h4.09c.24 0 .45-.17.51-.4l.41-2.65c.62-.26 1.2-.6 1.74-1l2.56 1c.23.1.49.02.61-.2l2.05-3.45c.1-.22.06-.47-.1-.65l-2.25-1.65zm-7.62 2.5c-1.93-.04-3.46-1.65-3.42-3.58a3.5 3.5 0 017 .08c0 1.94-1.59 3.51-3.54 3.5h-.04z"
    ></path>
  </svg>
);

const NextIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32">
    <path d="M26.17 12.37L9 2.45A3.23 3.23 0 007.38 2 3.38 3.38 0 004 5.38v21.29a3.33 3.33 0 005.1 2.82l17.19-10.86a3.65 3.65 0 00-.12-6.26z"></path>
  </svg>
);

const PrevIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32">
    <g transform="rotate(-180 16.002 16)">
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M26.17 12.37L9 2.45A3.23 3.23 0 007.38 2 3.38 3.38 0 004 5.38v21.29a3.33 3.33 0 005.1 2.82l17.19-10.86a3.65 3.65 0 00-.12-6.26z"
      ></path>
    </g>
  </svg>
);

const WarningIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 512 512">
    <path d="M505.403 406.394L295.389 58.102c-8.274-13.721-23.367-22.245-39.39-22.245s-31.116 8.524-39.391 22.246L6.595 406.394c-8.551 14.182-8.804 31.95-.661 46.37 8.145 14.42 23.491 23.378 40.051 23.378h420.028c16.56 0 31.907-8.958 40.052-23.379 8.143-14.421 7.89-32.189-.662-46.369zm-28.364 29.978a12.684 12.684 0 01-11.026 6.436H45.985a12.68 12.68 0 01-11.025-6.435 12.683 12.683 0 01.181-12.765L245.156 75.316A12.732 12.732 0 01256 69.192c4.41 0 8.565 2.347 10.843 6.124l210.013 348.292a12.677 12.677 0 01.183 12.764z"></path>
    <path d="M256.154 173.005c-12.68 0-22.576 6.804-22.576 18.866 0 36.802 4.329 89.686 4.329 126.489.001 9.587 8.352 13.607 18.248 13.607 7.422 0 17.937-4.02 17.937-13.607 0-36.802 4.329-89.686 4.329-126.489 0-12.061-10.205-18.866-22.267-18.866zm.311 180.301c-13.607 0-23.814 10.824-23.814 23.814 0 12.68 10.206 23.814 23.814 23.814 12.68 0 23.505-11.134 23.505-23.814 0-12.99-10.826-23.814-23.505-23.814z"></path>
  </svg>
);

const LogOutIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 512 512">
    <path
      fill="#fff"
      d="M363.335 488a24 24 0 01-24 24H113.082a80.09 80.09 0 01-80-80V80a80.09 80.09 0 0180-80h226.253a24 24 0 010 48H113.082a32.035 32.035 0 00-32 32v352a32.034 32.034 0 0032 32h226.253a24 24 0 0124 24zm108.553-248.97L357.837 124.978a24 24 0 10-33.937 33.941L396.977 232H208.041a24 24 0 100 48h188.935l-73.08 73.08a24 24 0 1033.941 33.941l114.051-114.05a24 24 0 000-33.941z"
    ></path>
  </svg>
);

const iconMap = {
  envelope: EnvelopeIcon,
  check: CheckIcon,
  close: CloseIcon,
  search: SearchIcon,
  plus: PlusIcon,
  minus: MineIcon,
  stats: StatsIcon,
  filter: FilterIcon,
  download: DownloadIcon,
  info: InfoIcon,
  layer: LayerIcon,
  down: DownIcon,
  user: UserIcon,
  mine: MineIcon,
  admin: AdminIcon,
  language: LanguageIcon,
  english: EnglishLanguageIcon,
  spanish: SpanishLangaugeIcon,
  x: XIcon,
  returnExit: ReturnExitIcon,
  checkCircle: CheckCircleIcon,
  checkMark: checkMarkIcon,
  xMark: xMarkIcon,
  trash: TrashIcon,
  settings: SettingsIcon,
  next: NextIcon,
  prev: PrevIcon,
  warning: WarningIcon,
  logout: LogOutIcon,
};

const SvgIconContainer = styled.div`
  align-items: center;
  overflow: hidden;
  color: ${(props) => props.color};
  cursor: ${(props) => props.cursor};
  display: flex;
  fill: ${(props) => props.color};
  height: ${(props) => props.size};
  max-height: ${(props) => props.size};
  max-width: ${(props) => props.size};
  padding: 2px;
  width: ${(props) => props.size};
  vertical-align: ${(props) => props.verticalAlign};

  &:hover {
    color: ${(props) => props.hoverColor};
    fill: ${(props) => props.hoverFill};
  }
`;
function SvgIcon({
  color,
  cursor,
  extraStyle,
  hoverColor,
  hoverFill,
  icon,
  onClick,
  size,
  verticalAlign,
}) {
  const Icon = iconMap[icon];

  return (
    <SvgIconContainer
      color={color}
      cursor={cursor}
      hoverColor={hoverColor}
      hoverFill={hoverFill}
      size={size}
      verticalAlign={verticalAlign}
      onClick={onClick}
      style={{ ...extraStyle }}
    >
      <Icon size={size} />
    </SvgIconContainer>
  );
}

SvgIcon.propTypes = {
  color: PropTypes.string,
  cursor: PropTypes.string,
  extraStyle: PropTypes.object,
  hoverColor: PropTypes.string,
  hoverFill: PropTypes.string,
  icon: PropTypes.oneOf(Object.keys(iconMap)).isRequired,
  onClick: PropTypes.func,
  size: PropTypes.string.isRequired,
  verticalAlign: PropTypes.string,
};

SvgIcon.defaultProps = {
  color: "currentColor",
  cursor: "pointer",
  extraStyle: {},
  verticalAlign: "middle",
};

export default SvgIcon;
