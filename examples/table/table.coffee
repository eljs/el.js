View = crowdcontrol.view.View

api = new crowdcontrol.data.Api 'http://localhost:12345'

class TableView extends View
  tag: 'example-live-table'
  html: """
    <div class="{ block: true, loading: loading }">
      <table>
        <thead>
          <tr>
            <th>Seconds Since Server Started</th>
          </tr>
        </thead>
        <tbody>
          <tr each="{ model }" class="animated bounceIn">
            <td><live-content model="{ value }"></td>
          </tr>
        </tbody>
      </table>
      <div class="loader">Loading...</div>
    </div>
  """
  js: ()->
    @loading = false

    api.scheduleEvery ()=>
      @loading = true
      api.get('seconds').then (data)=>
        @loading = false
        @model = JSON.parse(data.responseText)
        @update()
      @update()
    , 5000, true

TableView.register()

class ContentView extends View
  tag: 'live-content'
  html: """
    <div class="text-center">{ model }</div>
  """
  js: ()->

ContentView.register()

# class StreamingTable extends View
#   tag: 'example-streaming-table'
#   html: """
#     <div class="{ block: true, loading: loading }">
#       <table>
#         <thead>
#           <tr>
#             <th>Polygons in Random Order</th>
#           </tr>
#         </thead>
#         <tbody>
#           <tr each="{ model }" if="{ value != null }" class="{ animated: true, flipInX: !this.parent.animateOut, flipOutX: this.parent.animateOut }">
#             <td><live-content model="{ value }"></td>
#           </tr>
#           <tr></tr>
#         </tbody>
#       </table>
#       <div class="loader">Loading...</div>
#     </div>
#   """
#   js: ()->
#     @loading = false
#     @animateOut = false

#     src = new Source
#       name: 'table2'
#       api: api
#       path: 'polygon'
#       policy: streamingPolicy

#     src.on Source.Events.Loading, ()=>
#       @loading = true
#       @animateOut = true
#       @update()

#       setTimeout ()=>
#         @animateOut = false
#         @model = []
#         @update()
#       , 500

#     src.on Source.Events.LoadDataPartial, (data)=>
#       @update()
#       @model = data

#     src.on Source.Events.LoadData, (data)=>
#       @loading = false
#       @model = data
#       @update()

# StreamingTable.register()
