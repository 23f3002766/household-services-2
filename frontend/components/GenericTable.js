export default {
    props: ['columns', 'data'],
    template: `
    <main style="background: #f8f9fa; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
      <div class="table-responsive">
        <table class="table table-hover table-bordered border rounded shadow-sm" style="border-radius: 12px; overflow: hidden;">
          <thead style="border-radius: 12px;">
            <tr>
              <th v-for="col in columns" :key="col.key" class="p-3 text-center" style="background-color: #007bff; color: white; border-radius: 4px;">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in data" :key="rowIndex">
              <td v-for="col in columns" :key="col.key" class="text-truncate" style="max-width: 350px; white-space: nowrap; " >
                <!-- If a slot with the column key exists, render that slot. Otherwise, show the property -->
                <slot :name="col.key" :row="row">
                  {{ row[col.key] }}
                </slot>
                
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
    `,
    watch: {
      data: {
        deep: true,
        handler(newData) {
          this.internalData = [...newData]; // Ensure table updates
        }
      }
    }

  };
  