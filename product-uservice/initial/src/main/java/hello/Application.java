package hello;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMethod;

import hello.Products;
import hello.Orders;
import java.sql.*;
import org.json.simple.JSONObject;    
import org.json.simple.JSONArray; 
//import com.mysql.jdbc.Driver;

@SpringBootApplication
@RestController
public class Application {

    @RequestMapping(value = "/orders", method = RequestMethod.GET , produces = "application/json")
  public JSONArray orders() {
      /*
      Class.forName("com.mysql.jdbc.Driver");
      Connection conn=DriverManager.getConnection("jdbc:mysql://mysql-con:3306/db","root","root");  
      Statement stmt=conn.createStatement();  
      ResultSet rs=stmt.executeQuery("SELECT * FROM orders"); 
      */
      Orders o = new Orders();
      
	
      
      JSONArray r = new JSONArray();
      r.add(o);
      return r;
  }
    
    
  @RequestMapping(value = "/products", method = RequestMethod.GET , produces = "application/json")
  public JSONArray products() {
      try{
          
              Class.forName("com.mysql.jdbc.Driver");
              Connection conn=DriverManager.getConnection("jdbc:mysql://mysql:3306/db","root","12345");  
              Statement stmt=conn.createStatement();  
              ResultSet rs=stmt.executeQuery("SELECT * FROM products");  

              Products p;
              JSONArray r = new JSONArray();
          
              while (rs.next()){
                  
                  p = new Products();
                  p.product_id = rs.getInt("product_id");
                  p.type = rs.getString("type");
                  p.name = rs.getString("name");
                  p.price = rs.getString("price");
                  p.photo_url = rs.getString("photo_url");
                
                  r.add(p);
                  
              }
              conn.close();
            
              return r;
        }
      
      catch (Exception e){
          System.err.println("Got an exception! ");
          System.err.println(e.getMessage());
           Products pp = new Products();
      
      pp.product_id = 1;
      pp.type = "type";
      pp.name = "name";
      pp.price = "price";
      pp.photo_url = e.getMessage();
       JSONArray rr = new JSONArray();
       rr.add(pp);
      return rr;
      }
  }

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }

}
