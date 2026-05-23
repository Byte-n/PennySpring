import React from 'react';
import { View } from 'react-native';
import { Input, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const inputSearchDemoTitle = 'Search';

export function InputSearchDemo() {
  const styles = useStyles();
  const [searchValue, setSearchValue] = React.useState('PennySpring');
  const [submittedSearchValue, setSubmittedSearchValue] =
    React.useState('PennySpring');

  return (
    <>
      <View style={styles.stack}>
        <Input.Search
          clearable
          label="Default search"
          placeholder="Search"
          defaultValue="Component"
          onSearch={setSubmittedSearchValue}
        />
        <Input.Search
          clearable
          label="Controlled search"
          placeholder="Search component"
          value={searchValue}
          onChangeText={setSearchValue}
          onSearch={setSubmittedSearchValue}
        />
        <Input.Search
          disabled
          label="Disabled search"
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
