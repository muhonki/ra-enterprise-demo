import React, { Fragment } from "react";
import {
  AutocompleteInput,
  BooleanField,
  Datagrid,
  DateField,
  DateInput,
  EditButton,
  Filter,
  NullableBooleanInput,
  NumberField,
  ReferenceInput,
  SearchInput,
  TextField,
  TextInput,
} from "react-admin";
import {
  makeStyles,
  useMediaQuery,
  Divider,
  Tabs,
  Tab,
} from "@material-ui/core";
import { RealTimeList } from "@react-admin/ra-realtime";
import NbItemsField from "./NbItemsField";
import CustomerReferenceField from "../visitors/CustomerReferenceField";
import MobileGrid from "./MobileGrid";

const OrderFilter = (props) => (
  <Filter {...props}>
    <SearchInput source="q" alwaysOn />
    <ReferenceInput source="customer_id" reference="customers">
      <AutocompleteInput
        optionText={(choice) =>
          choice.first_name && choice.last_name
            ? `${choice.first_name} ${choice.last_name}`
            : ""
        }
      />
    </ReferenceInput>
    <DateInput source="date_gte" />
    <DateInput source="date_lte" />
    <TextInput source="total_gte" />
    <NullableBooleanInput source="returned" />
  </Filter>
);

const useDatagridStyles = makeStyles({
  total: { fontWeight: "bold" },
});

const orderRowStyle = (batchLevel) => (record, index) => {
  let backgroundColor;
  switch(record.batch){
    case 0:
      backgroundColor = "white";
      break;
    case batchLevel:
      backgroundColor = "#e6fbff";
      break;
    case 1:
      backgroundColor = "#e6fbff40";
      break;
    default:
      backgroundColor = "white";
  }

  return {
    backgroundColor,
  };
};

class TabbedDatagrid extends React.Component {
  tabs = [
    { id: "ordered", name: "ordered" },
    { id: "delivered", name: "delivered" },
    { id: "cancelled", name: "cancelled" },
  ];

  state = { ordered: [], delivered: [], cancelled: [] };

  static getDerivedStateFromProps(props, state) {
    if (props.ids !== state[props.filterValues.status]) {
      return { ...state, [props.filterValues.status]: props.ids };
    }
    return null;
  }

  handleChange = (event, value) => {
    const { filterValues, setFilters } = this.props;
    setFilters({ ...filterValues, status: value });
  };

  render() {
    const {
      isXSmall,
      classes,
      filterValues,
      batchLevel,
      ...props
    } = this.props;

    return (
      <Fragment>
        <Tabs
          variant="fullWidth"
          centered
          value={filterValues.status}
          indicatorColor="primary"
          onChange={this.handleChange}
        >
          {this.tabs.map((choice) => (
            <Tab key={choice.id} label={choice.name} value={choice.id} />
          ))}
        </Tabs>
        <Divider />
        {isXSmall ? (
          <MobileGrid {...props} ids={this.state[filterValues.status]} />
        ) : (
          <div>
            {filterValues.status === "ordered" && (
              <Datagrid
                {...props}
                ids={this.state.ordered}
                optimized
                rowClick="edit"
                rowStyle={orderRowStyle(batchLevel)}
                data-testid="order-ordered-datagrid"
              >
                <TextField source="id" />
                <NumberField source="batch" />
                <DateField source="date" showTime />
                <TextField source="reference" />
                <CustomerReferenceField />
                <NbItemsField />
                <NumberField
                  source="total"
                  options={{
                    style: "currency",
                    currency: "USD",
                  }}
                  className={classes.total}
                />
              </Datagrid>
            )}
            {filterValues.status === "delivered" && (
              <Datagrid {...props} ids={this.state.delivered}>
                <DateField source="date" showTime />
                <TextField source="reference" />
                <CustomerReferenceField />
                <NbItemsField />
                <NumberField
                  source="total"
                  options={{
                    style: "currency",
                    currency: "USD",
                  }}
                  className={classes.total}
                />
                <BooleanField source="returned" />
                <EditButton />
              </Datagrid>
            )}
            {filterValues.status === "cancelled" && (
              <Datagrid {...props} ids={this.state.cancelled}>
                <DateField source="date" showTime />
                <TextField source="reference" />
                <CustomerReferenceField />
                <NbItemsField />
                <NumberField
                  source="total"
                  options={{
                    style: "currency",
                    currency: "USD",
                  }}
                  className={classes.total}
                />
                <BooleanField source="returned" />
                <EditButton />
              </Datagrid>
            )}
          </div>
        )}
      </Fragment>
    );
  }
}

const StyledTabbedDatagrid = (props) => {
  const classes = useDatagridStyles();
  const isXSmall = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  const batchLevel = parseInt(localStorage.getItem("batchLevel"), 0) || 0;
  return (
    <TabbedDatagrid
      classes={classes}
      isXSmall={isXSmall}
      batchLevel={batchLevel}
      {...props}
    />
  );
};

const OrderList = ({ classes, ...props }) => (
  <RealTimeList
    {...props}
    filterDefaultValues={{ status: "ordered" }}
    sort={{ field: "date", order: "DESC" }}
    perPage={25}
    filters={<OrderFilter />}
  >
    <StyledTabbedDatagrid />
  </RealTimeList>
);

export default OrderList;