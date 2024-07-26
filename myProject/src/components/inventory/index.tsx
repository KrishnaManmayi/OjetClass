import { h } from "preact";
import { useState, useEffect, useCallback } from "preact/hooks";
import "ojs/ojformlayout";
import "ojs/ojinputtext";
import "ojs/ojknockout-keyset";
import "ojs/ojmutablearraydataprovider";
import "ojs/ojlistview"
import MutableArrayDataProvider = require("ojs/ojmutablearraydataprovider");
import { ojListView } from "ojs/ojlistview";

interface Product{
    id: number;
    productName: string,
    price: number,
    quantity: number
}

export function Inventory() {
    const [productName, setProductName] = useState<string>("");
    const [price, setPrice] = useState<number>();
    const [quantity, setQuantity] = useState<number>();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product>();
    const [ dataProvider ] = useState(() => {
        return new MutableArrayDataProvider(
          products, {
            keyAttributes: "id"
          }
        );
      });
    
    useEffect(() => {
        // getAllProducts();
        dataProvider.data = products;
        console.log(dataProvider.data);
    }, [ products ]);

    useEffect(()=>{
        getAllProducts();
    }, [dataProvider]);


    async function createProduct(){
        console.log(productName, price, quantity);
         await fetch('http://localhost:8080/createProduct', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({productName: productName, price: price, quantity: quantity})})
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setProducts(prevState => [...prevState, {
                    id: data.data._id, 
                    productName: data.data.productName,
                    price: data.data.price,
                    quantity: data.data.quantity
                }])
            })
            .catch(err => console.log(err))
    }

    async function getAllProducts() {
        console.log("Get All Products Called");
        
        await fetch('http://localhost:8080/getAllProducts', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }})
            .then(res => res.json())
            .then(data => {
                console.log(data); 
                data.forEach((element: any) => {
                    setProducts(prevState => [...prevState, 
                        {
                            id: element._id, 
                            productName: element.productName,
                            price: element.price,
                            quantity: element.quantity
                        }])
                });
            })
            .catch(err => console.log(err))
    }

    function productItemRenderer(item: ojListView.ItemTemplateContext){
        return (
            <div class="oj-flex">
              <div class="oj-flex-item">
                <span><strong>{item.data.productName}</strong></span>
              </div>
              <div class="oj-flex-item">
                <span>{item.data.price}</span>
              </div>
              <div class="oj-flex-item">
                <span>{item.data.quantity}</span>
              </div>
            </div>
          );
    }

    const selectedItemChangedHandler = useCallback(
        (event: ojListView.firstSelectedItemChanged<Product["id"], Product>) => {
          let tempItem = event.detail.value.data;
          setSelectedProduct(tempItem);
          console.log(tempItem);
          
        },
        [selectedProduct]
      );

    async function removeProduct(){
        await fetch('http://localhost:8080/deleteProduct/'+selectedProduct?.id, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }})
            .then(res => res.json())
            .then(data => {
                console.log(data); 
                setProducts(prevState => {return prevState.filter(product => product.id != selectedProduct?.id);})
            })
            .catch(err => console.log(err))
    }

    return (
      <div>
        <h1>Product Inventory</h1>
        <h5>Create a product</h5>
        <div style="width: 1px; min-width: 100%;">
            <oj-form-layout direction="row" maxColumns={4}>
                <oj-input-text value={productName} id="productName" labelHint="Product Name" onvalueChanged={(event) => setProductName(event.detail.value)}></oj-input-text>
                <oj-input-text value={price} id="price" labelHint="Price (In Rs)" onvalueChanged={(event) => setPrice(event.detail.value)}></oj-input-text>
                <oj-input-text value={quantity} id="quantity" labelHint="Quantity" onvalueChanged={(event) => setQuantity(event.detail.value)}></oj-input-text>
                <oj-button id="createBtn" onojAction={() => createProduct()}>Create Product</oj-button>
            </oj-form-layout>
        </div>

        <h5>List of products available</h5>
        <div>
            <oj-button onojAction={()=>removeProduct()}>Remove Selected Product</oj-button>
        </div>
        <oj-list-view
              id="listview"
              aria-label="list using observable array"
              data={dataProvider}
              selection-mode="single"
              onfirstSelectedItemChanged={selectedItemChangedHandler}>
              <template slot="itemTemplate" render={productItemRenderer}>
              </template>
            </oj-list-view>
      </div>
    );
};


