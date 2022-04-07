import React from "react";
import styled from "styled-components";

const OuterForm = styled.form`
  display: flex;
  padding-top: 2rem;
  justify-content: center;
`;

const OuterCard = styled.div`
  border: 2px solid black;
  border-radius: 4px;
  overflow: hidden;
  width: 25rem;
`;

const InnerCard = styled.div`
  padding: 1rem;
`;

const CardHeader = styled.h2`
  background-color: #f0ad4e;
  border-bottom: 2px solid black;
  font-size: larger;
  margin: -1px;
  padding: 1rem;
`;

export default function AccountForm({header, children}) {
  return (
    <OuterForm>
      <OuterCard>
        {header && (
          <CardHeader>
            {header}
          </CardHeader>
        )}
        <InnerCard>
          {children}
        </InnerCard>
      </OuterCard>
    </OuterForm>
  );
}
