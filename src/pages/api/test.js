export default function handler(req, res){
  const data ={
    "store_name": "Olympic",
    "purchase_date": "2013-05-13",
    "items": [
        {
            "name": "Morinaga Delicious Milk",
            "quantity": 1,
            "price": 259,
            "price_per_item": 259
        },
        {
            "name": "Guava Blend",
            "quantity": 1,
            "price": 399,
            "price_per_item": 399
        },
        {
            "name": "Hidaka Bite-sized Mozzarella",
            "quantity": 2,
            "price": 598,
            "price_per_item": 299
        },
        {
            "name": "Morinaga Milk Chews",
            "quantity": 3,
            "price": 717,
            "price_per_item": 239
        },
        {
            "name": "Kara Coconut Milk",
            "quantity": 1,
            "price": 249,
            "price_per_item": 249
        },
        {
            "name": "Maille Dijon Mustard",
            "quantity": 1,
            "price": 579,
            "price_per_item": 579
        },
        {
            "name": "Tomato",
            "quantity": 3,
            "price": 299,
            "price_per_item": 99.67
        },
        {
            "name": "Young Chicken Breast",
            "quantity": 2,
            "price": 712,
            "price_per_item": 356
        },
        {
            "name": "Bagged Cucumber PL",
            "quantity": 2,
            "price": 398,
            "price_per_item": 199
        }
    ],
    "total": 4546
}
  try{
    res.status(200).json({
        message: "Itens adicionados",
        result: data,})
  }catch (e) {
      console.error(e);
      res.status(500).json({ message: "Erro no processamento" });
  } 
  
}