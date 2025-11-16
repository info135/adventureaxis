import connectDB from "@/lib/connectDB";
import Product from "@/models/Product";
import Quantity from "@/models/Quantity";

export async function POST(req) {
  await connectDB();
  const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  // console.log(`--- Starting quantity update process [${requestId}] ---`);
  // console.time(`updateQuantities-${requestId}`);

  try {
    const { items } = await req.json();
    // // console.log(`[${requestId}] Received update request for ${items?.length || 0} items`);
    
    // // Log first 3 items for debugging (to avoid huge logs)
    // if (items?.length > 0) {
    //   // console.log(`[${requestId}] Sample items (first 3):`, JSON.stringify(items.slice(0, 3), null, 2));
    // }

    if (!Array.isArray(items) || items.length === 0) {
      const error = 'No items provided for quantity update';
      // console.error(`[${requestId}] ${error}`);
      return new Response(
        JSON.stringify({ 
          success: false,
          error,
          results: []
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const [index, item] of items.entries()) {
      const { productId, variantId = 0, quantity, size } = item;
      // console.log(`\n[${requestId}] Processing item ${index + 1}/${items.length}:`, { 
      //   productId, 
      //   variantId, 
      //   quantity,
      //   size,
      //   item // Log the full item for debugging
      // });

      // Validate required fields
      if (!productId) {
        const error = 'Missing productId';
        // console.error(`[${requestId}] Validation failed:`, { productId, variantId, quantity, error, item });
        results.push({
          productId,
          variantId,
          success: false,
          error
        });
        continue;
      }

      if (quantity === undefined || quantity === null) {
        const error = 'Missing or invalid quantity';
        // console.error('Validation failed:', { productId, variantId, quantity, error });
        results.push({
          productId,
          variantId,
          success: false,
          error
        });
        continue;
      }

      try {
        // Find the product
        let product;
        try {
          product = await Product.findById(productId);
          if (!product) {
            // console.error(`[${requestId}] Product not found in database:`, { productId });
            // Try to find by productId field as fallback
            product = await Product.findOne({ productId: productId });
            if (!product) {
              // console.error(`[${requestId}] Product also not found by productId field:`, { productId });
              // Try to find by name or other identifier for debugging
              const itemName = item.name || item.productName || 'Unknown';
              const similarProducts = await Product.find({
                $or: [
                  { name: { $regex: itemName, $options: 'i' } },
                  { 'productCode': item.productCode || '' }
                ]
              }).limit(3);
              
              // console.error(`[${requestId}] Similar products found:`, similarProducts.map(p => ({
              //   _id: p._id,
              //   name: p.name,
              //   productCode: p.productCode,
              //   quantity: p.quantity
              // })));
              
              const error = 'Product not found in database';
              results.push({
                productId,
                variantId,
                success: false,
                error,
                details: {
                  attemptedId: productId,
                  similarProducts: similarProducts.map(p => ({
                    _id: p._id,
                    name: p.name,
                    productCode: p.productCode
                  }))
                }
              });
              continue;
            }
          }
        } catch (dbError) {
          // console.error(`[${requestId}] Database error when finding product:`, {
          //   error: dbError.message,
          //   productId,
          //   stack: dbError.stack
          // });
          results.push({
            productId,
            variantId,
            success: false,
            error: 'Database error while finding product',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          });
          continue;
        }
        // console.log('Found product:', { name: product.name, _id: product._id });

        // Find the quantity document
        const quantityDoc = await Quantity.findById(product.quantity);
        if (!quantityDoc) {
          const error = 'Quantity document not found';
          // console.error(error, { productQuantityRef: product.quantity });
          results.push({
            productId,
            variantId,
            success: false,
            error
          });
          continue;
        }
        // console.log('Found quantity document:', { 
        //   _id: quantityDoc._id, 
        //   variantsCount: quantityDoc.variants?.length || 0,
        //   currentTotal: quantityDoc.total || 0
        // });

        // Ensure variants array exists
        if (!quantityDoc.variants) {
          // console.log('Initializing empty variants array');
          quantityDoc.variants = [];
        }

        // Convert variantId to number in case it's a string
        const variantIndex = Number(variantId);
        
        // Ensure variant exists at index
        while (quantityDoc.variants.length <= variantIndex) {
          // console.log(`Adding new variant at index ${quantityDoc.variants.length}`);
          quantityDoc.variants.push({ 
            qty: 0,
            size: `Variant ${quantityDoc.variants.length + 1}`,
            weight: 0
          });
        }

        // Get current quantity before update
        const currentVariant = quantityDoc.variants[variantIndex] || {};
        const currentQty = currentVariant.qty || 0;
        
        // console.log('Current quantity:', { 
        //   variantId: variantIndex, 
        //   currentQty, 
        //   requestedDecrease: quantity,
        //   variantDetails: currentVariant
        // });

        // Update the quantity (decrease by ordered quantity)
        const newQty = Math.max(0, currentQty - quantity); // Prevent negative quantities
        quantityDoc.variants[variantIndex].qty = newQty;
        // console.log('New quantity after update:', newQty);

        // Recalculate total
        const previousTotal = quantityDoc.total || 0;
        quantityDoc.total = quantityDoc.variants.reduce(
          (sum, v) => sum + (v.qty || 0),
          0
        );
        // console.log('Updated total quantity:', { previousTotal, newTotal: quantityDoc.total });

        // Save the updated quantity document
        const savedDoc = await quantityDoc.save();
        // console.log('Successfully updated quantity in database:', {
        //   savedDocId: savedDoc._id,
        //   updatedVariant: savedDoc.variants[variantIndex]
        // });

        results.push({
          productId,
          variantId: variantIndex,
          success: true,
          previousQty: currentQty,
          newQty,
          message: 'Quantity updated successfully',
          variantDetails: savedDoc.variants[variantIndex]
        });
      } catch (error) {
        // console.error('Error updating quantity:', {
        //   error: error.message,
        //   stack: error.stack,
        //   productId,
        //   variantId
        // });
        results.push({
          productId,
          variantId,
          success: false,
          error: error.message,
          errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    }

    // Check if all updates were successful
    const allSuccess = results.every(r => r.success);
    const someSuccess = results.some(r => r.success);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    // console.log(`\n[${requestId}] --- Update Summary ---`);
    // console.log(`[${requestId}] Total items: ${results.length}`);
    // console.log(`[${requestId}] Successfully updated: ${successCount}`);
    // console.log(`[${requestId}] Failed to update: ${failureCount}`);
    // console.timeEnd(`updateQuantities-${requestId}`);
    
    // results.forEach((result, index) => {
    //   if (result.success) {
    //     // console.log(`[${requestId}] [${index}] Success: Product ${result.productId}, Variant ${result.variantId}: ${result.previousQty} → ${result.newQty}`);
    //   } else {
    //     // console.error(`[${requestId}] [${index}] Failed: Product ${result.productId || 'N/A'}, Variant ${result.variantId || 'N/A'}: ${result.error || 'Unknown error'}`);
    //     if (result.details) {
    //       // console.error(`[${requestId}] [${index}] Failure details:`, result.details);
    //     }
    //   }
    // });

    if (allSuccess) {
      const response = {
        success: true,
        message: 'All quantities updated successfully',
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failureCount
        }
      };
      // console.log('\nSending success response:', JSON.stringify(response, null, 2));
      return new Response(JSON.stringify(response), { status: 200 });
      
    } else if (someSuccess) {
      const response = {
        success: true,
        message: 'Some quantities updated successfully',
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failureCount
        }
      };
      // console.warn('\nSending partial success response:', JSON.stringify(response, null, 2));
      return new Response(JSON.stringify(response), { status: 207 }); // Multi-status
      
    } else {
      const response = {
        success: false,
        message: 'Failed to update quantities',
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failureCount
        }
      };
      // console.error('\nSending error response:', JSON.stringify(response, null, 2));
      return new Response(JSON.stringify(response), { status: 400 });
    }

  } catch (error) {
    const errorId = `err-${Date.now()}`;
    console.error(`[${requestId}] Error in updateQuantities [${errorId}]:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      requestId
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `An error occurred while updating quantities. Reference: ${errorId}`,
        errorId,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Error-ID': errorId
        }
      }
    );
  }
}

export const dynamic = 'force-dynamic';
