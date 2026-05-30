import ShippingList from "./form_response/pages/ListShipping";
import CategoryList from "./category/pages/ListCategory";
import AttributeList from "./attribute/pages/ListAttribute";
import AttributeValueList from "./attribute-value/pages/ListAttributeValue";
import BrandList from "./brand/page/ListBrand"
export default function Admin() {
  return (
    <div>
      <ShippingList />
      <CategoryList />
      <AttributeList />
      <AttributeValueList />
      <BrandList />

    </div>

  )
}