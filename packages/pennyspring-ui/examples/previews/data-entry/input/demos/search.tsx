import React from 'react';
import { View } from 'react-native';
import { Input, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function InputSearchDemo() {
  const styles = useStyles();
  const [searchValue, setSearchValue] = React.useState('PennySpring');
  const [submittedSearchValue, setSubmittedSearchValue] =
    React.useState('PennySpring');

  return (
    <>
      <View style={styles.stack}>
        <Input.Search
          allowClear
          labelText="Default search"
          placeholder="Search"
          defaultValue="Component"
          onSearch={setSubmittedSearchValue}
        />
        <Input.Search
          allowClear
          labelText="Controlled search"
          placeholder="Search component"
          value={searchValue}
          onChange={setSearchValue}
          onSearch={setSubmittedSearchValue}
        />
        <Input.Search
          disabled
          labelText="Disabled search"
          defaultValue="Disabled"
        />
        <Text color="description" size="sm">
          Submitted: {submittedSearchValue}
        </Text>
      </View>
    </>
  );
}

export default InputSearchDemo;
