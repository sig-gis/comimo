import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { requiredBy } from "airbnb-prop-types";
import Button from "../components/Button";

/**
 * Style functions for the Modal component
 */

const ModalWrapper = styled.div`
  background-color: rgba(0, 0, 0, 0.4);
  height: 100%;
  left: 0px;
  overflow: hidden;
  outline: 0;
  position: fixed;
  top: 0px;
  transition: opacity 0.15s linear;
  width: 100%;
  z-index: 5000;
`;

const ModalContainer = styled.div`
  margin: 15% auto;
  max-width: 55%;
  min-width: 35%;
  text-align: left;
  width: fit-content;
`;

const ModalContent = styled.div`
  background-color: rgb(255, 255, 255);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 0px;
  width: 100%;
`;

const ModalTitle = styled.div`
  align-items: center;
  background-color: rgb(249, 175, 59);
  border-bottom: 1px soild #dee2e6;
  display: flex;
  flex-flow: row nowrap;
  height: 2.5rem;
  justify-content: space-between;
  padding: 0.25rem 0.7rem;
  width: 100%;
`;

const CloseButton = styled.button`
  background-color: transparent;
  border: 0;
  color: #000;
  cursor: pointer;
  float: right;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  margin: -1rem -1rem -1rem auto;
  opacity: 0.5;
  padding: 1rem 1rem;
  text-shadow: 0 1px 0 #fff;

  &:hover {
    opacity: 1;
  }
`;

const ModalBody = styled.div`
  flex: 1 1 auto;
  padding: 1rem;
  position: relative;
`;

const ButtonContainer = styled.div`
  align-items: center;
  border-top: 1px solid #dee2e6;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding: 0.75rem;
`;

/**
 * Component for a generic modal.
 * To display a confirm button, use `confirmLabel` and `onConfirm`
 *
 * @example
 * <Modal title={title} onClose={() => setState({showModal: false})}>
 *   <p>Your changes have been saved</p>
 * </Modal>
 */

export default function Modal({ title, children, closeText, confirmText, onClose, onConfirm }) {
  return (
    <ModalWrapper id="confirmModal" onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()} role="document">
        <ModalContent id="confirmModalContent">
          <ModalTitle>
            <h5 id="confirmModalTitle">{title}</h5>
            <CloseButton aria-label="Close" onClick={onClose} type="button">
              &times;
            </CloseButton>
          </ModalTitle>
          <ModalBody>{children}</ModalBody>
          <ButtonContainer>
            <Button buttonText={closeText} clickHandler={onClose} secondaryButton={true} />
            {typeof onConfirm === "function" && (
              <Button
                buttonText={confirmText}
                clickHandler={onConfirm}
                extraStyle={{ marginLeft: "1rem" }}
              />
            )}
          </ButtonContainer>
        </ModalContent>
      </ModalContainer>
    </ModalWrapper>
  );
}

Modal.propTypes = {
  closeText: PropTypes.string,
  confirmText: requiredBy("onConfirm", PropTypes.string),
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  title: PropTypes.string.isRequired,
};

Modal.defaultProps = {
  closeText: "OK",
  confirmText: null,
  onConfirm: null,
};
