import React, { useState, useContext } from "react";
import styled from "@emotion/styled";
import { useAtom } from "jotai";

import Button from "../components/Button";
import Search from "../components/Search";
import Select from "../components/Select";
import ToolCard from "../components/ToolCard";

import LoadingModal from "../components/LoadingModal";
import { MainContext } from "../components/PageLayout";
import { URLS } from "../constants";
import { jsonRequest } from "../utils";

import { processModal, showModalAtom } from "../../../src/js/home";

export default function DownloadPanel({
  active,
  featureNames,
  map,
  mapquestKey,
  selectedDates,
  selectedRegion,
  setSelectedRegion,
}) {
  const [clipOption, setClipOption] = useState(1);
  const [downloadURL, setDownloadURL] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [mineType, setMineType] = useState("cMines");
  const [showModal, setShowModal] = useAtom(showModalAtom);

  const {
    localeText: { download, validate },
  } = useContext(MainContext);

  const getDownloadUrl = () => {
    // const { selectedRegion, selectedDates } = this.props;
    // const { clipOption, mineType } = this.state;

    const region = clipOption === 1 ? "all" : selectedRegion;

    processModal(
      () =>
        jsonRequest(URLS.GET_DL_URL, {
          region,
          dataLayer: selectedDates[mineType],
        })
          .then((resp) => {
            setDownloadURL([region, selectedDates[mineType], resp]);
          })
          .catch((err) => {
            console.error(err);
          }),
      setShowModal
    );
  };

  return (
    <ToolCard title={download?.title} active={active}>
      {showModal && <LoadingModal message="Getting URL" />}

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>{`${validate?.typeLabel}:`}</label>
        <Select
          id="selectMineType"
          onChange={(e) => setMineType(e.target.value)}
          options={["pMines", "nMines", "cMines"].map((k) => ({
            value: k,
            label: validate?.[k],
          }))}
          value={mineType}
        />
        <div style={{ marginTop: ".25rem" }}>
          <input
            checked={clipOption === 1}
            name="downloadRegion"
            onChange={() => setClipOption(1)}
            type="radio"
          />
          <span>{download?.allRadio}</span>
        </div>
        {/* TODO: disabled-group is not defined yet */}
        <div className={selectedRegion ? "" : "disabled-group"} style={{ marginTop: ".25rem" }}>
          <input
            checked={clipOption === 2}
            name="downloadRegion"
            onChange={() => setClipOption(2)}
            type="radio"
          />
          <span>{download?.selectedRadio}</span>
        </div>
        <div>
          <Title>{download?.selectMuni}</Title>
          <Search
            featureNames={featureNames}
            map={map}
            mapquestKey={mapquestKey}
            setSelectedRegion={setSelectedRegion}
          ></Search>
        </div>
        {selectedDates && (
          <Button
            onClick={getDownloadUrl}
            extraStyle={{ marginTop: "0.25rem" }}
            isDisabled={fetching}
          >{`${download?.getUrl} ${selectedDates?.[mineType]}`}</Button>
        )}
        {fetching ? (
          <p>{`${download?.fetching}...`}</p>
        ) : (
          downloadURL && (
            <p>
              <span>
                <a href={downloadURL[2]}>
                  {`${download.clickHere}` +
                    ` ${
                      downloadURL[0] === "all"
                        ? download?.completeData
                        : download?.munData + downloadURL[0]
                    }` +
                    ` ${download?.prep}` +
                    ` ${downloadURL[1]}.`}
                </a>
              </span>
            </p>
          )
        )}
      </div>
    </ToolCard>
  );
}

const Title = styled.h2`
  border-bottom: 1px solid gray;
  font-weight: bold;
  padding: 0.5rem;
`;

// export default class DownloadPanel extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       clipOption: 1,
//       downloadURL: false,
//       fetching: false,
//       mineType: "cMines",
//       showModal: false,
//     };
//   }

//   processModal = (callBack) =>
//     new Promise(() =>
//       Promise.resolve(
//         this.setState({ showModal: true }, () =>
//           callBack().finally(() => this.setState({ showModal: false }))
//         )
//       )
//     );

//   getDownloadUrl = () => {
//     const { selectedRegion, selectedDates } = this.props;
//     const { clipOption, mineType } = this.state;

//     const region = clipOption === 1 ? "all" : selectedRegion;
//     this.processModal(() =>
//       jsonRequest(URLS.GET_DL_URL, { region, dataLayer: selectedDates[mineType] })
//         .then((resp) => {
//           this.setState({ downloadURL: [region, selectedDates[mineType], resp] });
//         })
//         .catch((err) => {
//           console.error(err);
//         })
//     );
//   };

//   render() {
//     const { clipOption, fetching, downloadURL, mineType } = this.state;
//     const { featureNames, fitMap, mapquestKey, selectedDates, selectedRegion, selectRegion } =
//       this.props;
//     const {
//       localeText: { download, validate },
//     } = this.context;
//     const Title = styled.h2`
//       border-bottom: 1px solid gray;
//       font-weight: bold;
//       padding: 0.5rem;
//     `;
//     return (
//       <ToolCard title={download.title}>
//         {this.state.showModal && <LoadingModal message="Getting URL" />}

//         <div style={{ display: "flex", flexDirection: "column" }}>
//           <label>{`${validate.typeLabel}:`}</label>
//           <Select
//             id="selectMineType"
//             onChange={(e) => this.setState({ mineType: e.target.value })}
//             options={["pMines", "nMines", "cMines"].map((k) => ({ value: k, label: validate[k] }))}
//             value={mineType}
//           />
//           <div style={{ marginTop: ".25rem" }}>
//             <input
//               checked={clipOption === 1}
//               name="downloadRegion"
//               onChange={() => this.setState({ clipOption: 1 })}
//               type="radio"
//             />
//             <span>{download.allRadio}</span>
//           </div>
//           {/* TODO: disabled-group is not defined yet */}
//           <div className={selectedRegion ? "" : "disabled-group"} style={{ marginTop: ".25rem" }}>
//             <input
//               checked={clipOption === 2}
//               name="downloadRegion"
//               onChange={() => this.setState({ clipOption: 2 })}
//               type="radio"
//             />
//             <span>{download.selectedRadio}</span>
//           </div>
//           <div>
//             <Title>{download.selectMuni}</Title>
//             <Search
//               featureNames={featureNames}
//               fitMap={fitMap}
//               mapquestKey={mapquestKey}
//               selectRegion={selectRegion}
//             ></Search>
//           </div>
//           {selectedDates && (
//             <Button
//               onClick={this.getDownloadUrl}
//               extraStyle={{ marginTop: "0.25rem" }}
//               isDisabled={fetching}
//             >{`${download.getUrl} ${selectedDates[mineType]}`}</Button>
//           )}
//           {fetching ? (
//             <p>{`${download.fetching}...`}</p>
//           ) : (
//             downloadURL && (
//               <p>
//                 <span>
//                   <a href={downloadURL[2]}>
//                     {`${download.clickHere}` +
//                       ` ${
//                         downloadURL[0] === "all"
//                           ? download.completeData
//                           : download.munData + downloadURL[0]
//                       }` +
//                       ` ${download.prep}` +
//                       ` ${downloadURL[1]}.`}
//                   </a>
//                 </span>
//               </p>
//             )
//           )}
//         </div>
//       </ToolCard>
//     );
//   }
// }
// DownloadPanel.contextType = MainContext;
