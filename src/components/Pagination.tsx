import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator'
import { useState } from 'react'

interface props {
    totalRecords: number,
    setPage(arg: number): void,
    page: number;
}

function Pagination({ totalRecords, setPage, page }: props) {
    const [rowsPerPage, setRowsPerPage] = useState(12)
    
    function onPageChange (event: PaginatorPageChangeEvent) {
        setRowsPerPage(event.rows)
        setPage(event.page)
    }
    return (
        <div className="card">
            <Paginator first={page * rowsPerPage} rows={rowsPerPage} totalRecords={totalRecords} onPageChange={onPageChange} />
        </div>
    )
}

export default Pagination
