import { Company } from 'src/companies/company.entity';
import { Invoice } from 'src/invoices/invoice.entity';

function getHtmlString(): any {
  return `
    
    <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Document</title>
  </head>
  <body>
      <div class="container">
          <div class="row">
              <div class="col-md-12">
                  <div class="card">
                      <div class="card-header">
                          <h4 class="card-title">Invoice</h4>
                      </div>  
                      <div class="card-body">
                          <div class="row">
                              <div class="col-md-12">
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="form-group">
                                              <label>Company Name</label>
                                              <input type="text" class="form-control" placeholder="Company Name" value="Company Name">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="form-group">
                                              <label>Company Address</label>
                                              <input type="text" class="form-control" placeholder="Company Address" value="Company Address">  
                                          </div>
                                      </div>
                                  </div>
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="form-group">
                                              <label>Company Email</label>
                                              <input type="text" class="form-control" placeholder="Company Email" value="Company Email">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="form-group">
                                              <label>Company Phone</label>
                                              <input type="text" class="form-control" placeholder="Company Phone" value="Company Phone">
                                          </div>
                                      </div>
                                  </div>
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="form-group">
                                              <label>Customer Name</label>  
                                              <input type="text" class="form-control" placeholder="Customer Name" value="Customer Name">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="form-group">
                                              <label>Customer Email</label>
                                              <input type="text" class="form-control" placeholder="Customer Email" value="Customer Email">
                                          </div>
                                      </div>
                                  </div>
                                  <div class="row">
                                      <div class="col-md-6">
                                          <div class="form-group">
                                              <label>Customer Phone</label>
                                              <input type="text" class="form-control" placeholder="Customer Phone" value="Customer Phone">
                                          </div>
                                      </div>
                                      <div class="col-md-6">
                                          <div class="form-group">
                                              <label>Customer Address</label>
                                              <input type="text" class="form-control" placeholder="Customer Address" value="Customer Address">
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div class="row">
                              <div class="col-md-12">
                                  <div class="table-responsive">
                                      <table class="table">
                                          <thead class=" text-primary">
                                              <th>
                                                  Item
                                              </th>
                                              <th>
                                                  Description
                                              </th>
                                              <th>
                                                  Quantity
                                              </th>
                                              <th>
                                                  Unit Price
                                              </th>
                                              <th>
                                                  Total
                                              </th>
                                          </thead>
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      Item 1
                                                  </td>
                                                  <td>  
                                                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                                  </td>
                                                  <td>
                                                      1
                                                  </td>
                                                  <td>
                                                      $20
                                                  </td>
                                                  <td>
                                                      $20
                                                  </td>
                                              </tr>
                                              </tbody>
                                      </table>
                                  </div>
                              </div>
                          </div>
                          <div class="row">
                              <div class="col-md-6">
                                  <div class="form-group">
                                      <label>Subtotal</label>
                                      <input type="text" class="form-control" placeholder="Subtotal" value="Subtotal">
                                  </div>
                              </div>
                              <div class="col-md-6">
                                  <div class="form-group">
                                      <label>Tax</label>
                                      <input type="text" class="form-control" placeholder="Tax" value="Tax">
                                  </div>
                              </div>
                          </div>
                          <div class="row">
                              <div class="col-md-6">
                                  <div class="form-group">
                                      <label>Discount</label>
                                      <input type="text" class="form-control" placeholder="Discount" value="Discount">
                                  </div>
                              </div>
                              <div class="col-md-6">
                                  <div class="form-group">
                                      <label>Total</label>
                                      <input type="text" class="form-control" placeholder="Total" value="Total">
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
  
              </div>
          </div>
      </div>
  </body>
  </html>
    `;
}

export function getInvoicesReportHtml(
  invoices: Invoice[],
  company: Company,
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Invoices</title>
        <style>
        table,
        th,
        td {
            border: 1px solid black;
            border-collapse: collapse;
            padding: 5px;
        }
 
        tr:nth-child(odd) {
            background-color: #8F9AA5;
        }

        .center {
            text-align: center;
        }
        
        </style>
    </head>
    <body>
        <div class="container">
            <div class="row center">
                <img src="http://localhost:4200/assets/images/logoSmall.png" alt="logo" class="img-fluid">
            </div>
            <div class="row center">
                <h1>Prowess</h1>
            </div>
            <hr>
            <div class="row">
                <div class="col-md-1">
                    <h4>Company Name:</h4>
                </div>
                <div class="col-md-1">
                    ${company.name}
                </div>
            </div>
            <div class="row">
                <div class="col-md-3">
                    <h4>Invoice Date:</h4>
                </div>
                <div class="col-md-9">
                    ${new Date().getDate()}/${
    new Date().getMonth() + 1
  }/${new Date().getFullYear()} ${new Date().toTimeString()}
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-md-6">
                    <h3>Invoices:</h3>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <table class="table">
                        <thead class="text-primary">
                            <th>
                                ID
                            </th>
                            <th>
                                Customer
                            </th>
                            <th>
                                Phone Number
                            </th>
                            <th>
                                Due Date
                            </th>
                            <th>
                                Is Paid
                            </th>
                            <th>
                                Collected By
                            </th>
                            <th>
                                Collected At
                            </th>
                            <th>
                                Total
                            </th>
                        </thead>
                        <tbody>
                            ${invoices
                              .map(
                                (invoice) => `
                                <tr>
                                    <td>
                                        ${invoice.id}
                                    </td>
                                    <td>
                                        ${invoice.user.name}
                                    </td>
                                    <td>
                                        ${invoice.user.phoneNumber}
                                    </td>
                                    <td>
                                        ${
                                          invoice.dueDate
                                            ? invoice.dueDate.getFullYear() +
                                              '/' +
                                              (invoice.dueDate.getMonth() + 1) +
                                              '/' +
                                              invoice.dueDate.getDate()
                                            : ''
                                        }
                                    </td>
                                    <td>
                                        ${invoice.isPaid}
                                    </td>
                                    <td>
                                        ${
                                          invoice.collectedBy
                                            ? invoice.collectedBy.name
                                            : 'N/A'
                                        }
                                    </td>
                                    <td>
                                    ${
                                      invoice.collected_at
                                        ? invoice.collected_at.toString()
                                        : ''
                                    }
                                    </td>
                                    <td>
                                        ${invoice.total} $
                                    </td>
                                </tr>
                            `,
                              )
                              .join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function getInvoicePdf(invoice: Invoice, customerAddressString: string) {
  return `
    
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Invoice</title>
        <style>
            body {
                margin-top: 20px;
                background-color: #f7f7ff;
            }
            #invoice {
                padding: 0px;
            }
            
            .invoice {
                position: relative;
                background-color: #fff;
                min-height: 680px;
                padding: 15px;
            }
            
            .invoice header {
                padding: 10px 0;
                margin-bottom: 20px;
                border-bottom: 1px solid #0d6efd;
            }
            
            .invoice .company-details {
                text-align: right;
            }
            
            .invoice .company-details .name {
                margin-top: 0;
                margin-bottom: 0;
            }
            
            .invoice .contacts {
                margin-bottom: 20px;
            }
            
            .invoice .invoice-to {
                text-align: left;
            }
            
            .invoice .invoice-to .to {
                margin-top: 0;
                margin-bottom: 0;
            }
            
            .invoice .invoice-details {
                text-align: right;
            }
            
            .invoice .invoice-details .invoice-id {
                margin-top: 0;
                color: #0d6efd;
            }
            
            .invoice main {
                padding-bottom: 50px;
            }
            
            .invoice main .thanks {
                margin-top: -100px;
                font-size: 2em;
                margin-bottom: 50px;
            }
            
            .invoice main .notices {
                padding-left: 6px;
                border-left: 6px solid #0d6efd;
                background: #e7f2ff;
                padding: 10px;
            }
            
            .invoice main .notices .notice {
                font-size: 1.2em;
            }
            
            .invoice table {
                width: 100%;
                border-collapse: collapse;
                border-spacing: 0;
                margin-bottom: 20px;
            }
            
            .invoice table td,
            .invoice table th {
                padding: 15px;
                background: #eee;
                border-bottom: 1px solid #fff;
            }
            
            .invoice table th {
                white-space: nowrap;
                font-weight: 400;
                font-size: 16px;
            }
            
            .invoice table td h3 {
                margin: 0;
                font-weight: 400;
                color: #0d6efd;
                font-size: 1.2em;
            }
            
            .invoice table .qty,
            .invoice table .total,
            .invoice table .unit {
                text-align: right;
                font-size: 1.2em;
            }
            
            .invoice table .no {
                color: #fff;
                font-size: 1.6em;
                background: #0d6efd;
            }
            
            .invoice table .unit {
                background: #ddd;
            }
            
            .invoice table .total {
                background: #0d6efd;
                color: #fff;
            }
            
            .invoice table tbody tr:last-child td {
                border: none;
            }
            
            .invoice table tfoot td {
                background: 0 0;
                border-bottom: none;
                white-space: nowrap;
                text-align: right;
                padding: 10px 20px;
                font-size: 1.2em;
                border-top: 1px solid #aaa;
            }
            
            .invoice table tfoot tr:first-child td {
                border-top: none;
            }
            .card {
                position: relative;
                display: flex;
                flex-direction: column;
                min-width: 0;
                word-wrap: break-word;
                background-color: #fff;
                background-clip: border-box;
                border: 0px solid rgba(0, 0, 0, 0);
                border-radius: 0.25rem;
                margin-bottom: 1.5rem;
                box-shadow: 0 2px 6px 0 rgb(218 218 253 / 65%),
                0 2px 6px 0 rgb(206 206 238 / 54%);
            }
            
            .invoice table tfoot tr:last-child td {
                color: #0d6efd;
                font-size: 1.4em;
                border-top: 1px solid #0d6efd;
            }
            
            .invoice table tfoot tr td:first-child {
                border: none;
            }
            
            .invoice footer {
                width: 100%;
                text-align: center;
                color: #777;
                border-top: 1px solid #aaa;
                padding: 8px 0;
            }
            
            @media print {
                .invoice {
                font-size: 11px !important;
                overflow: hidden !important;
                }
                .invoice footer {
                position: absolute;
                bottom: 10px;
                page-break-after: always;
                }
                .invoice > div:last-child {
                page-break-before: always;
                }
            }
            
            .invoice main .notices {
                padding-left: 6px;
                border-left: 6px solid #0d6efd;
                background: #e7f2ff;
                padding: 10px;
            }
            .center {
                text-align: center;
            }
        </style>
    </head>
    <body>
        
        <div class="container">
            <div class="card">
                <div class="card-body">
                <div id="invoice">

                    <div class="invoice overflow-auto">
                    <div style="min-width: 600px">
                        <header>
                            <div class="row">
                                <div class="col center">
                                <a href="http://localhost:4200">
                                    <img src="http://localhost:4200/assets/images/logoSmall.png" alt="logo" class="img-fluid">
                                </a>
                            </div>

                        </header>
                    </div>
                    <main>
                        <div class="row contacts">
                            <div class="col invoice-to">
                                <div class="text-gray-light">INVOICE TO:</div>
                                <h2 class="to">${invoice.user.name}</h2>
                                <div class="address">${customerAddressString}</div>
                                <div class="email">tel: ${
                                  invoice.user.phoneNumber
                                }</div>
                                <div class="email">email: ${
                                  invoice.user.email
                                }</div>
                            </div>
                            <div class="col invoice-details">
                                <h1 class="invoice-id">
                                    INVOICE: ${invoice.id}
                                </h1>
                                <div class="date"><h2>Due Date:</h2>
                                    <h3>
                                        ${
                                          invoice.dueDate
                                            ? invoice.dueDate.getFullYear() +
                                              '/' +
                                              (invoice.dueDate.getMonth() + 1) +
                                              '/' +
                                              invoice.dueDate.getDate()
                                            : ''
                                        }
                                    </h3>
                                </div>
                                <tr>
                                <td colspan="2"></td>
                                <td colspan="2">${
                                  invoice.isPaid
                                    ? '<h2 style="color:green">Is Paid</h2>'
                                    : '<h2 style="color:red">Not Paid</h2>'
                                }</td>
                            </tr>
                            </div>
                        </div>
                        <table>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th class="text-left">DESCRIPTION</th>
                                <th class="text-right">PRICE</th>
                                <th class="text-right">QTY</th>
                                <th class="text-right">TOTAL</th>
                            </tr>
                            </thead>
                            <tbody>
                            ${invoice.plans
                              .map(
                                (plan) => `
                            <tr>
                                <td class="no">${plan.id}</td>
                                <td class="text-left">
                                <h3>
                                    <a target="_blank" href="javascript:;">
                                    ${plan.name}
                                    </a>
                                </h3>
                                <!-- <a target="_blank" href="javascript:;">
                                    Useful videos
                                </a> to improve your Javascript skills. Subscribe and stay tuned :) -->
                                </td>
                                <td class="unit">${plan.price}</td>
                                <td class="qty">1</td>
                                <td class="total">${plan.price}</td>
                            </tr>
                            `,
                              )
                              .join('')}


                            ${invoice.items
                              .map(
                                (item) => `
                            <tr>
                                <td class="no">${item.id}</td>
                                <td class="text-left">
                                <h3>
                                    <a target="_blank" href="javascript:;">
                                    ${item.name}
                                    </a>
                                </h3>
                                </td>
                                <td class="unit">${item.price}</td>
                                <td class="qty">1</td>
                                <td class="total">${item.price}</td>
                            </tr>
                            `,
                              )
                              .join('')}
                            </tbody>
                            <tfoot>
                            <!-- <tr>
                                <td colspan="2"></td>
                                <td colspan="2">SUBTOTAL</td>
                                <td>${invoice.total}$</td>
                            </tr> -->
                            <tr>
                                <td colspan="2"></td>
                                <td colspan="2">Extra Amount:</td>
                                <td>${invoice.extraAmount}</td>
                            </tr>
                            <tr>
                                <td colspan="2"></td>
                                <td colspan="2">GRAND TOTAL</td>
                                <td>${invoice.total}</td>
                            </tr>
                            </tfoot>
                        </table>
                        <div class="thanks" style="margin-top: 10px" >Thank you!</div>
                        <div class="notices">
                            <div>Note:</div>
                            <div class="notice">${invoice.notes}</div>
                        </div>
                        </main>
                        <footer>Invoice was created on a computer and is valid without the signature and seal.</footer>
                    </div>
                    <!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
                    <div></div>
                    </div>
                    <div class="toolbar hidden-print">
                    <hr>
                    </div>
                </div>
                </div>
            </div>
        </div>

    </body>
    </html>

    `;
}
